import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Function to get API key - read directly from .env file if process.env doesn't have it
function getApiKey() {
  // Try process.env first
  let key = process.env.OPENAI_API_KEY?.trim();
  
  // If not found or too short, read directly from .env file
  if (!key || key.length < 40) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const envPath = join(__dirname, "..", ".env");
      const envContent = readFileSync(envPath, "utf-8");
      const lines = envContent.split("\n");
      const keyLine = lines.find(line => line.startsWith("OPENAI_API_KEY="));
      if (keyLine) {
        key = keyLine.split("=")[1]?.trim();
      }
    } catch (error) {
      // If file read fails, use process.env or throw
    }
  }
  
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set. Please check your .env file.");
  }
  
  // Validate key format
  if (!key.startsWith("sk-")) {
    throw new Error("API key doesn't start with 'sk-'. Please check your .env file.");
  }
  
  if (key.length < 40) {
    throw new Error(`API key is too short (${key.length} chars). Expected 50+ characters.`);
  }
  
  return key;
}

// Create client with a function that gets fresh key
const getClient = () => {
  return new OpenAI({
    apiKey: getApiKey()
  });
};

// Multiple angles and variations to force uniqueness - expanded for maximum variety
const ANGLES = [
  "primary benefit and value proposition",
  "key features and functionality",
  "specific use cases and applications",
  "problem-solving capabilities",
  "target audience and user experience",
  "quality and performance characteristics",
  "unique selling points and advantages",
  "versatility and adaptability",
  "professional-grade capabilities",
  "innovative design and technology",
  "durability and longevity",
  "ease of use and convenience",
  "safety and reliability",
  "cost-effectiveness and value",
  "advanced technology and innovation",
  "user satisfaction and results",
  "premium materials and construction",
  "expert-recommended solutions",
  "materials and construction quality",
  "size, capacity, and dimensions",
  "color, style, and aesthetic appeal",
  "manufacturer reputation and expertise",
  "demographic and user-specific features",
  "activity and use-case specificity",
  "performance and output characteristics",
  "craftsmanship and attention to detail",
  "environmental and sustainability factors",
  "integration and compatibility features",
  "scalability and future-proofing",
  "competitive advantages and differentiation"
];

const DESCRIPTIVE_STYLES = [
  "focus on what makes it special",
  "emphasize practical benefits",
  "highlight professional applications",
  "describe user experience",
  "focus on quality and reliability",
  "emphasize versatility",
  "highlight innovation",
  "describe performance characteristics",
  "emphasize effectiveness",
  "highlight superior design",
  "focus on user satisfaction",
  "describe premium quality",
  "emphasize proven results",
  "highlight expert craftsmanship",
  "focus on materials and construction",
  "emphasize specific features and specifications",
  "highlight target audience benefits",
  "describe use cases and applications",
  "focus on durability and longevity",
  "emphasize ease of use and convenience",
  "highlight safety and reliability",
  "describe value and cost-effectiveness",
  "focus on innovation and technology",
  "emphasize aesthetic appeal and design"
];

const TONE_VARIATIONS = [
  "professional and informative",
  "benefit-focused and compelling",
  "feature-rich and detailed",
  "user-centric and practical",
  "quality-emphasized and premium",
  "expert and authoritative",
  "descriptive and comprehensive",
  "benefit-driven and persuasive",
  "informative and educational",
  "premium and sophisticated",
  "practical and results-oriented",
  "detailed and specific",
  "user-friendly and accessible",
  "professional and trustworthy"
];

function pickAngle() {
  return ANGLES[Math.floor(Math.random() * ANGLES.length)];
}

function pickDescriptiveStyle() {
  return DESCRIPTIVE_STYLES[Math.floor(Math.random() * DESCRIPTIVE_STYLES.length)];
}

function pickTone() {
  return TONE_VARIATIONS[Math.floor(Math.random() * TONE_VARIATIONS.length)];
}

// Extract phrases from text (fast, no API call)
function extractPhrases(text, productWords, stopWords, phraseLength) {
  const words = text.toLowerCase().split(/\s+/).filter(w => {
    const wClean = w.replace(/[^a-z0-9]/g, '');
    return wClean.length >= 3 && !stopWords.has(wClean) && !productWords.some(pw => wClean.includes(pw) || pw.includes(wClean));
  });
  
  const phrases = [];
  for (let i = 0; i <= words.length - phraseLength; i++) {
    const phrase = words.slice(i, i + phraseLength).join(' ');
    if (phrase.length > 5) { // Only keep meaningful phrases
      phrases.push(phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }
  
  return phrases.filter((p, i, arr) => arr.indexOf(p) === i); // Remove duplicates
}

// Generate keywords from title and description if AI fails to generate proper ones
async function generateKeywordsFromContent(productName, title, description, client) {
  try {
    const keywordPrompt = `
You are generating SEO keywords for a product. The product already has a title and description. Your job is to extract and generate relevant keywords that users would search for.

PRODUCT NAME: "${productName}"
TITLE: "${title}"
DESCRIPTION: "${description}"

CRITICAL INSTRUCTIONS:
1. Look at the TITLE and DESCRIPTION above
2. Extract the key terms, features, and benefits mentioned
3. Generate 12-15 SEO keywords based on what the TITLE and DESCRIPTION say about the product
4. DO NOT include the product name "${productName}" or any words from it
5. Focus on: product type, features, benefits, use cases, synonyms, related terms
6. Think about what someone would type into Google to find this TYPE of product
7. Use both single words and 2-3 word phrases
8. Examples: If title mentions "silicone lubricant", keywords could be: "Silicone Lubricant", "Personal Lubricant", "Intimate Care", "Lubrication", "Silicone Based", "Personal Care", "Intimate Products", "Lubricant Gel", "Silicone Gel", "Personal Hygiene", "Intimate Wellness", "Care Products"

IMPORTANT: Extract keywords directly from the TITLE and DESCRIPTION. If the title says "silicone lubricant", include "Silicone Lubricant" as a keyword. If description mentions "intimate care", include "Intimate Care" as a keyword.

Return ONLY a comma-separated list of keywords, nothing else. No JSON, no explanation, just keywords separated by commas.
Example format: Silicone Lubricant, Personal Lubricant, Intimate Care, Lubrication, Silicone Based, Personal Care, Intimate Products, Lubricant Gel, Silicone Gel, Personal Hygiene, Intimate Wellness, Care Products
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an SEO keyword expert. Generate relevant search keywords based on product titles and descriptions. Never include the product name itself."
        },
        {
          role: "user",
          content: keywordPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty keyword response");

    // Parse keywords from response
    const productWords = productName.toLowerCase().split(/\s+/);
    const productNameLower = productName.toLowerCase();
    
    let generatedKeywords = text
      .split(",")
      .map(k => k.trim())
      .filter(Boolean)
      .filter(k => {
        const kwLower = k.toLowerCase();
        
        // Filter out if keyword contains any product name word
        const containsProductWord = productWords.some(pw => kwLower.includes(pw.toLowerCase()));
        
        // Filter out if keyword is the full product name
        const isFullProductName = kwLower === productNameLower || kwLower.includes(productNameLower);
        
        // Filter out if keyword is just product name with slight variations
        const kwWords = kwLower.split(/\s+/).filter(Boolean);
        const isProductNameVariant = kwWords.every(word => 
          productWords.some(pw => word === pw || word.startsWith(pw) || pw.startsWith(word))
        ) && kwWords.length <= productWords.length + 1;
        
        return !containsProductWord && !isFullProductName && !isProductNameVariant;
      });

    // If we don't have enough keywords, extract more from title/description
    if (generatedKeywords.length < 10) {
      // Extract additional keywords from title and description
      const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const descWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      // Find meaningful words that aren't product name words
      const meaningfulWords = [...titleWords, ...descWords]
        .filter(word => {
          const wordLower = word.toLowerCase();
          // Skip product name words
          if (productWords.some(pw => wordLower.includes(pw.toLowerCase()) || pw.toLowerCase().includes(wordLower))) {
            return false;
          }
          // Skip common stop words
          const stopWords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'are', 'was', 'been', 'have', 'will', 'would', 'should', 'could'];
          if (stopWords.includes(wordLower)) return false;
          // Only keep words that are 4+ characters
          return word.length >= 4;
        })
        .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
        .slice(0, 10);
      
      generatedKeywords = [...generatedKeywords, ...meaningfulWords].filter((kw, index, arr) => arr.indexOf(kw) === index).slice(0, 15);
    }

    // Final check - if still not enough, add generic fallbacks
    if (generatedKeywords.length < 8) {
      const fallbacks = ["Personal Care", "Intimate Products", "Wellness", "Care Products", "Health Products", "Personal Items", "Intimate Care", "Wellness Products"];
      generatedKeywords = [...generatedKeywords, ...fallbacks]
        .filter((kw, index, arr) => arr.indexOf(kw) === index)
        .slice(0, 15);
    }

    console.log(`[generateKeywordsFromContent] Final keywords for "${productName}":`, generatedKeywords);
    return generatedKeywords.slice(0, 15); // Max 15 keywords
  } catch (error) {
    console.error(`[generateKeywordsFromContent] Error:`, error);
    // Fallback: extract keywords from title/description manually
    try {
      const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const descWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const productWords = productName.toLowerCase().split(/\s+/);
      
      const extracted = [...titleWords, ...descWords]
        .filter(w => !productWords.some(pw => w.includes(pw) || pw.includes(w)))
        .filter((w, i, arr) => arr.indexOf(w) === i)
        .slice(0, 10);
      
      if (extracted.length > 0) {
        console.log(`[generateKeywordsFromContent] Using extracted keywords as fallback:`, extracted);
        return extracted;
      }
    } catch (extractError) {
      console.error(`[generateKeywordsFromContent] Extraction fallback also failed:`, extractError);
    }
    
    // Last resort fallback
    return ["Personal Care", "Intimate Products", "Wellness", "Care Products", "Health Products"];
  }
}

// Function to research the product first to get accurate information
async function researchProduct(productName, client) {
  const researchPrompt = `
You are researching a product to get ACCURATE information before writing SEO content. This is critical - false information cannot be published.

PRODUCT NAME: "${productName}"

RESEARCH INSTRUCTIONS:
1. Think carefully about what this product actually is based on the name
2. Consider the brand/company if mentioned (e.g., "Gender X" is a sexual wellness brand)
3. Use your knowledge to identify the EXACT product type
4. Be specific - "sexual wellness product" is better than "product"
5. If the name suggests multiple possibilities, use context clues (brand, words in name)

IMPORTANT: 
- "Snuggle Up" from "Gender X" brand = sexual wellness product (strap-on/harness kit), NOT a blanket
- If you see "Gender X" brand, it's ALWAYS a sexual wellness product
- Do NOT guess based on words alone - consider the brand context

Return JSON ONLY with accurate information:
{
  "productType": "specific accurate category (e.g., 'sexual wellness product - strap-on kit', 'blanket', 'electronics', etc.)",
  "primaryFunction": "what the product actually does (be specific)",
  "keyFeatures": "main features or characteristics",
  "confidence": "HIGH if certain, MEDIUM if somewhat certain, LOW if uncertain"
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a product researcher. Your job is to accurately identify products. Be specific and accurate. If you're not certain, say so."
        },
        {
          role: "user",
          content: researchPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 200
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty research response");

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Research did not return JSON");

    const research = JSON.parse(text.slice(start, end + 1));
    console.log(`[researchProduct] Research result for "${productName}":`, research);
    return research;
  } catch (error) {
    console.error(`[researchProduct] Error researching product:`, error);
    return null;
  }
}

export async function generateSeoText(productName, retries = 0, productDescription = null) {
  // Get fresh API key and create client
  const apiKey = getApiKey();
  const client = getClient();
  
  // Skip research call to speed up generation - rely on AI's knowledge instead
  const research = null;
  
  // If product description is provided, use it for better context
  let descriptionContext = "";
  if (productDescription && productDescription.trim()) {
    descriptionContext = `
═══════════════════════════════════════════════════════════════════════════════
⚠️ MANDATORY: PRODUCT DESCRIPTION PROVIDED - YOU MUST USE THIS ⚠️
═══════════════════════════════════════════════════════════════════════════════

PRODUCT DESCRIPTION:
"${productDescription}"

CRITICAL REQUIREMENTS (MANDATORY - YOUR RESPONSE WILL BE REJECTED IF YOU IGNORE THIS):
1. READ THE PRODUCT DESCRIPTION ABOVE CAREFULLY
2. Extract SPECIFIC features, benefits, materials, and use cases mentioned in the description
3. Your title MUST reference specific features or benefits from the description
4. Your description MUST be based on what the product description says - DO NOT use generic phrases
5. Your keywords MUST be extracted from the product description's features and benefits
6. DO NOT use generic phrases like "Provides reliable performance" or "Experience the difference"
7. DO NOT use the same description template for different products
8. Each product MUST have completely unique content based on its specific description
9. If the description mentions "anal desensitizer", mention that specifically
10. If the description mentions "silicone-based", mention that specifically
11. If the description mentions "water-based", mention that specifically
12. If the description mentions "warming", "tingling", "flavored", mention those specifically

FORBIDDEN GENERIC PHRASES (DO NOT USE):
- "Provides reliable performance in various conditions"
- "Experience the difference with this quality product"
- "Designed with user comfort in mind"
- "Easy to use and maintain"
- "Designed for maximum performance"
- Any variation of these generic phrases

YOU MUST CREATE UNIQUE CONTENT FOR THIS SPECIFIC PRODUCT BASED ON ITS DESCRIPTION.
═══════════════════════════════════════════════════════════════════════════════
`;
  }

  // Pick random angle, descriptive style, and tone for maximum uniqueness
  const angle = pickAngle();
  const descriptiveStyle = pickDescriptiveStyle();
  const tone = pickTone();
  
  // Add multiple layers of randomness to ensure different outputs EVERY time
  const randomSeed = Math.floor(Math.random() * 1000000);
  const timestamp = Date.now();
  const generationId = Math.random().toString(36).substring(2, 15);
  const variationNumber = Math.floor(Math.random() * 1000);
  
  // Force different word choices by including random synonyms/alternatives
  const wordVariations = [
    "professional", "expert-grade", "commercial-quality", "industrial-grade", "premium", "high-end",
    "innovative", "advanced", "cutting-edge", "state-of-the-art", "modern", "sophisticated",
    "durable", "long-lasting", "robust", "sturdy", "reliable", "dependable",
    "effective", "efficient", "powerful", "high-performance", "superior", "excellent"
  ];
  const selectedVariation = wordVariations[Math.floor(Math.random() * wordVariations.length)];
  
  // Force different title structures each time
  const titleStructures = [
    "${productName} [${selectedVariation}] [type] [designed/engineered/built] [for/purpose] [additional detail].",
    "${productName} [quality level] [type] [with/featuring] [${selectedVariation}] [feature] [benefit].",
    "${productName} [${selectedVariation}] [designed/engineered] [for] [target audience] [with] [key feature].",
    "${productName} [type] [with] [${selectedVariation}] [construction] [for] [use case] [benefit].",
    "${productName} [quality] [${selectedVariation}] [type] [built/designed] [to] [action] [result].",
    "${productName} [${selectedVariation}] [type] [for] [specific use] [with] [feature] [and] [benefit]."
  ];
  const selectedStructure = titleStructures[Math.floor(Math.random() * titleStructures.length)];

  // Build prompt with research information
  let researchContext = "";
  if (research && research.productType) {
    researchContext = `
PRODUCT RESEARCH RESULTS:
- Product Type: ${research.productType}
- Primary Function: ${research.primaryFunction}
- Key Features: ${research.keyFeatures}
- Confidence: ${research.confidence}

CRITICAL: Use the research information above to write ACCURATE SEO content. Do NOT deviate from the research findings.
`;
  } else {
    researchContext = `
WARNING: Product research was inconclusive. Use your knowledge carefully and be as accurate as possible.
If you are uncertain about the product type, use general but accurate terms.
`;
  }

  const prompt = `
You are writing SEO metadata for a PRODUCT page following professional SEO best practices. It is CRITICAL that you accurately identify what the product actually is and create UNIQUE content every single time.

⚠️ THIS IS A UNIQUE REQUEST - GENERATION #${variationNumber} AT ${timestamp} ⚠️
You MUST create completely different content than any previous generation. This is NOT a repeat request.

PRODUCT NAME:
"${productName}"

${descriptionContext}

${researchContext}

ANGLE TO FOCUS ON:
${angle}

DESCRIPTIVE STYLE:
${descriptiveStyle}

TONE:
${tone}

WORD VARIATION TO USE:
Use words like "${selectedVariation}" and similar terms - DO NOT use the same descriptive words you used before.

MANDATORY TITLE STRUCTURE FOR THIS GENERATION:
You MUST use this exact structure template: ${selectedStructure}
Fill in the brackets with appropriate words, but follow this structure EXACTLY.
This structure is unique to generation #${variationNumber} - previous generations used different structures.

GENERATION ID: ${generationId}
VARIATION NUMBER: ${variationNumber}
RANDOM SEED: ${randomSeed}
TIMESTAMP: ${timestamp}
REQUEST ID: ${Date.now()}-${Math.random().toString(36).substring(2, 15)}

CRITICAL UNIQUENESS REQUIREMENTS:
- You MUST create a COMPLETELY DIFFERENT title and description every single time
- NEVER repeat the same descriptive phrases, word choices, or sentence structures
- Vary your focus: sometimes emphasize materials, sometimes features, sometimes use cases, sometimes quality
- Use different descriptive words each time - if you used "professional" before, use "expert-grade" or "commercial-quality" next time
- Change sentence structure - vary where you place key information
- The product name length does NOT determine uniqueness - always create fresh, varied content

PROFESSIONAL TITLE GUIDELINES (Based on SEO Best Practices):
- MUST START with the product name exactly as provided: "${productName}"
- After the product name, ADD descriptive information that answers these questions (vary which ones you focus on each time):
  * What is it specifically? (be detailed and specific)
  * What does it do? (primary function and benefits)
  * What is it made of? (materials, construction)
  * Who is it for? (target audience, demographics)
  * What are its key features? (size, color, style, capacity, output, quality level)
  * What makes it special? (unique selling points)
- The total title should be 70-85 characters to reach approximately 580 pixels
- CRITICAL: Make the title longer and more descriptive to get closer to 580px target
- ACCURATELY describe what the product actually is - do not guess incorrectly
- Use the ANGLE and DESCRIPTIVE STYLE above to guide your approach
- Vary your descriptive phrases - use different words, focus on different aspects each time
- DO NOT use: stop words, all CAPS, abbreviations (except common acronyms), exclamation points, @s or TMs, superlatives (best, greatest, awesome), or repeat the same word twice
- Only capitalize the first letter of each word (Title Case)
- End with a period
- Format: "${productName} [unique descriptive information that adds at least 40 characters, completely varied each time]."
- MANDATORY: Your title MUST include the word "${selectedVariation}" or a synonym of it
- MANDATORY: Your title structure MUST be different from any previous generation (see structure rules above)

CRITICAL TITLE UNIQUENESS (READ CAREFULLY - THIS IS MANDATORY):
- ⚠️ THIS IS GENERATION #${variationNumber} - YOU MUST CREATE A COMPLETELY DIFFERENT TITLE ⚠️
- ⚠️ IF YOU GENERATE THE SAME TITLE AS BEFORE, YOUR RESPONSE WILL BE REJECTED ⚠️

YOU MUST FOLLOW THIS EXACT STRUCTURE TEMPLATE (NO EXCEPTIONS):
${selectedStructure}

REPLACE THE BRACKETS WITH APPROPRIATE WORDS:
- [${selectedVariation}] = Use "${selectedVariation}" or a synonym
- [type] = The product type/category
- [designed/engineered/built] = Choose ONE of these verbs
- [for/purpose] = The purpose or use case
- [quality level] = A quality descriptor (NOT "premium" - use something else)
- [with/featuring] = Choose ONE of these prepositions
- [feature] = A specific feature
- [benefit] = A benefit or result
- [target audience] = Who it's for
- [key feature] = A key feature
- [use case] = When/where it's used
- [action] = An action verb
- [result] = The result or outcome
- [additional detail] = Extra descriptive information

CRITICAL RULES:
- Generation ${variationNumber} MUST use structure template above
- You MUST use "${selectedVariation}" in your title
- FORBIDDEN WORDS FOR THIS GENERATION (DO NOT USE): "premium", "expert", "featuring"
- If generation ${variationNumber} is odd: FORBIDDEN words also include "materials", "craftsmanship"
- If generation ${variationNumber} is even: FORBIDDEN words also include "performance", "reliability"
- You MUST use DIFFERENT words than any previous generation
- Focus on: ${variationNumber % 2 === 0 ? 'MATERIALS, CONSTRUCTION, DURABILITY' : 'PERFORMANCE, FUNCTIONALITY, RESULTS'}
- Target length: ${70 + (variationNumber % 15)}-${85 + (variationNumber % 10)} characters
- ⚠️ IF YOUR TITLE CONTAINS "featuring premium materials and expert" OR ANY SIMILAR PHRASE, IT IS WRONG - START OVER ⚠️

PROFESSIONAL DESCRIPTION GUIDELINES (Based on SEO Best Practices):
- Write 2-3 sentences (aim for approximately 155-165 characters to reach approximately 990 pixels)
${productDescription ? `
⚠️ MANDATORY: YOU HAVE A PRODUCT DESCRIPTION - USE IT! ⚠️
- First sentence: Based on the product description, explain what the product is and its PRIMARY FUNCTION as described
- Second sentence: Extract and describe SPECIFIC FEATURES mentioned in the product description (e.g., "silicone-based", "water-based", "warming", "flavored", "desensitizing", etc.)
- Third sentence: Mention SPECIFIC BENEFITS or USE CASES from the product description
- DO NOT use generic phrases - every sentence must reference something from the product description
- If the description says "anal desensitizer", your description must mention that
- If the description says "silicone-based", your description must mention that
- If the description says "warming lubricant", your description must mention that
- Make it SPECIFIC to THIS product based on its description
` : `
- First sentence: ACCURATELY explain what the product actually is, its primary use, and include a read-friendly version of the revised product name
- Second sentence: Describe key features, benefits, or what makes it special (vary focus each time)
- Optional third sentence: Mention who it's for, when to use it, or additional value proposition
`}
- Write in active voice that speaks to the reader
- Use American English spelling, grammar, and punctuation
- Write for your intended audience first, search engines second
- Natural, human language - no hype, no generic marketing phrases
- DO NOT simply repeat the product name - create descriptive, informative content
- Vary your sentence structure and word choice each time
- End with a period
- Make it informative and compelling while staying concise
- CRITICAL: Accurately identify the product type - do not misidentify it
- The description must be long enough to reach close to 990 pixels when measured
- ⚠️ FORBIDDEN: Do NOT use generic phrases like "Provides reliable performance" or "Experience the difference" - these are REJECTED
- EXAMPLE VARIATIONS (same product, different descriptions):
  * "Widget Pro Professional Grade Tool provides advanced functionality for expert users requiring precision and reliability. This commercial-quality instrument features premium construction and innovative design elements that deliver superior performance in demanding applications. Ideal for professionals who demand the highest standards."
  * "Widget Pro High-Performance Industrial Tool is engineered for precision work and expert-level applications. With its advanced technology and durable construction, this tool offers exceptional reliability and user satisfaction. Designed for professionals seeking superior results."
  * "Widget Pro Commercial Quality Multi-Purpose Tool combines innovative design with premium materials for exceptional versatility. This expert-recommended solution delivers outstanding performance across multiple use cases, making it ideal for professionals who value quality and effectiveness."

RULES FOR KEYWORDS (CRITICAL - READ CAREFULLY):
${productDescription ? `
⚠️ MANDATORY: YOU HAVE A PRODUCT DESCRIPTION - EXTRACT KEYWORDS FROM IT! ⚠️
- Read the product description carefully and extract SPECIFIC terms mentioned
- If description mentions "anal desensitizer", include: "Anal Desensitizer", "Desensitizing Gel", "Anal Numbing"
- If description mentions "silicone-based", include: "Silicone Lubricant", "Silicone Based Lube", "Silicone Gel"
- If description mentions "water-based", include: "Water Based Lubricant", "Water Based Lube"
- If description mentions "warming", include: "Warming Lubricant", "Warming Lube", "Heat Lubricant"
- If description mentions "flavored", include: "Flavored Lubricant", "Flavored Lube", "Strawberry Lube", etc.
- If description mentions "tingling", include: "Tingling Lubricant", "Tingling Sensation"
- Extract ALL specific features, materials, and benefits from the description
- DO NOT use generic keywords - every keyword must relate to something in the product description
` : `
- You MUST generate 10-15 unique, relevant SEO keywords and phrases that relate to the PRODUCT TYPE and FEATURES
`}
- ABSOLUTELY FORBIDDEN: DO NOT include ANY words from the product name "${productName}"
- ABSOLUTELY FORBIDDEN: DO NOT split the product name into keywords
- Example of WRONG: If product is "Gender X Snuggle Up", DO NOT return "Gender, X, Snuggle, Up" or "Gender X, Snuggle Up" or anything with those words
- Example of CORRECT: If the product is a sexual wellness/strap-on product, return: "Anal, Numbing, Lubricant, Anal Numbing Cream, Personal Lubricant, Intimate Care, Desensitizing Gel, Anal Play, Comfort Lubricant, Numbing Agent, Intimate Wellness, Anal Comfort, Lubrication Aid, Desensitizing Product, Anal Preparation"
- Think about what users would ACTUALLY type into Google to find this TYPE of product (not the specific product name)
- Focus on: product category, features, benefits, use cases, synonyms, related terms
- Mix of single words (e.g., "Anal", "Numbing") AND multi-word phrases (e.g., "Anal Numbing Cream", "Personal Lubricant")
- Separate keywords with commas
- No generic words like "buy", "cheap", "best", "product", "Quality Products", "Premium Items", "Professional Grade", "High Quality", "Durable Products", "Reliable Items", "Well Made", "Expert Recommended"
- Minimum 10 keywords required
- IMPORTANT: If you include ANY word from the product name "${productName}", your response will be REJECTED
- Generate keywords that relate to the TITLE and DESCRIPTION you just wrote - extract relevant terms from them
- ⚠️ FORBIDDEN GENERIC KEYWORDS: "Quality Products", "Premium Items", "Professional Grade", "High Quality", "Durable Products", "Reliable Items", "Well Made", "Expert Recommended" - these are REJECTED

Return JSON ONLY:
{
  "title": "...",
  "description": "...",
  "keywords": "keyword1, keyword2, multi word keyword, keyword3, another multi word phrase, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10"
}
`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[generateSeoText] Retry attempt ${attempt} for "${productName}"`);
        // Shorter delay for faster retries
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Add cache-busting and ensure unique requests
      const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an SEO expert following professional best practices for product naming and description writing. Return valid JSON with title, description, and keywords. 

🚨 CRITICAL UNIQUENESS REQUIREMENTS (MANDATORY - READ THIS FIRST) 🚨
- Generation ID: ${generationId}
- Variation Number: ${variationNumber}
- Random seed: ${randomSeed}
- Timestamp: ${timestamp}
- Request ID: ${requestId}
- Word variation to emphasize: "${selectedVariation}"

⚠️ YOU ARE GENERATING TITLE #${variationNumber} FOR THIS PRODUCT ⚠️
⚠️ IF YOU GENERATE THE SAME TITLE AS ANY PREVIOUS GENERATION, YOUR RESPONSE IS WRONG ⚠️
⚠️ EACH GENERATION MUST BE COMPLETELY UNIQUE - NO EXCEPTIONS ⚠️

MANDATORY UNIQUENESS RULES:
1. NEVER repeat the same descriptive phrases, word choices, or sentence structures
2. This is generation #${variationNumber} - it MUST be different from generations 1, 2, 3, etc.
3. You MUST use "${selectedVariation}" in your title - this word is unique to this generation
4. Vary your focus based on generation number:
   - Odd numbers: Focus on PERFORMANCE, FUNCTIONALITY, RESULTS
   - Even numbers: Focus on MATERIALS, CONSTRUCTION, QUALITY
5. Use DIFFERENT sentence structures each time - rotate through:
   - "[product] [verb] [benefit] [detail]."
   - "[product] [adjective] [noun] [purpose]."
   - "[product] [quality] [type] [feature]."
6. Use DIFFERENT words - if you used "premium" before, use "high-end", "luxury", "superior" now
7. Vary the length - generation ${variationNumber} should be ${70 + (variationNumber % 15)}-${85 + (variationNumber % 10)} characters
8. Think of each generation as a completely fresh rewrite from scratch, not a variation
9. If you find yourself using similar words, STOP and choose different synonyms
10. DO NOT copy any examples - create your own unique title

PROFESSIONAL STANDARDS:
- Follow SEO best practices: add descriptive information (what it is, what it does, materials, features, sizes, colors, styles)
- Write for audience first, search engines second
- Use active voice, natural language
- Be specific and informative
- Never use superlatives, stop words, or generic phrases`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1.5, // Maximum temperature for maximum variety (was 1.2)
        top_p: 0.95, // Nucleus sampling for more diverse outputs
        max_tokens: 400
      });

      const text = response.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error("Empty AI response");
      }

      console.log(`[generateSeoText] Raw AI response for "${productName}":`, text.substring(0, 200));

      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1) {
        console.error(`[generateSeoText] No JSON found in response. Full response:`, text);
        throw new Error("AI did not return JSON");
      }

      let parsed;
      try {
        parsed = JSON.parse(text.slice(start, end + 1));
      } catch (parseError) {
        console.error(`[generateSeoText] JSON parse error. Text:`, text.slice(start, end + 1));
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
      }

      // Validate that we got title and description
      if (!parsed.title || !parsed.description) {
        console.error("AI response missing title or description:", parsed);
        throw new Error("AI response missing required fields");
      }

      // Validate that title starts with product name and has additional content
      const titleTrimmed = parsed.title.trim();
      const titleLower = titleTrimmed.toLowerCase();
      const productLower = productName.toLowerCase();
      
      if (!titleLower.startsWith(productLower)) {
        console.warn(`[generateSeoText] Title doesn't start with product name. Title: "${titleTrimmed}", Product: "${productName}"`);
        // Fix it by prepending the product name
        parsed.title = `${productName} ${titleTrimmed}`.trim();
      } else {
        // Check if title is just the product name (no additional content)
        const titleWithoutProduct = titleTrimmed.substring(productName.length).trim();
        // Remove any trailing punctuation for length check
        const titleContent = titleWithoutProduct.replace(/^[.,!?]+|[.,!?]+$/g, "").trim();
        // Require at least 30 characters of descriptive content after product name
        if (titleContent.length < 30 || titleContent === "" || titleTrimmed === productName || titleTrimmed === `${productName}.`) {
          console.error(`[generateSeoText] Title is just product name with no additional content: "${titleTrimmed}" (content length: ${titleContent.length})`);
          throw new Error("AI returned title with insufficient descriptive content after product name - retrying...");
        }
      }
      
      // Additional check: if title equals product name exactly (case-insensitive)
      if (titleTrimmed.toLowerCase() === productName.toLowerCase() || 
          titleTrimmed.toLowerCase() === `${productName.toLowerCase()}.`) {
        console.error(`[generateSeoText] Title exactly matches product name: "${titleTrimmed}"`);
        throw new Error("AI returned title that exactly matches product name - retrying...");
      }
      
      // Clean up description - remove any double periods
      parsed.description = parsed.description.trim().replace(/\.{2,}/g, ".");
      
      // Validate that description is not just the product name
      const descLower = parsed.description.trim().toLowerCase();
      if (descLower === productLower || descLower === `${productLower}.`) {
        console.error(`[generateSeoText] AI returned product name as description for "${productName}"`);
        throw new Error("AI returned product name as description - retrying...");
      }
      
      // Validate content matches research (if research was available)
      if (research && research.productType) {
        const titleText = parsed.title.toLowerCase();
        const descText = parsed.description.toLowerCase();
        const researchType = research.productType.toLowerCase();
        
        // Check for common misidentifications
        const isSexualWellness = researchType.includes("sexual") || researchType.includes("wellness") || researchType.includes("strap-on");
        const mentionsBlanket = titleText.includes("blanket") || descText.includes("blanket") || (titleText.includes("cozy") && descText.includes("warmth"));
        
        if (isSexualWellness && mentionsBlanket) {
          console.error(`[generateSeoText] MISMATCH: Research says "${research.productType}" but content mentions blanket/cozy`);
          throw new Error("Generated content doesn't match product research - retrying...");
        }
      }

      // ALWAYS extract keywords from title and description - STRIP PRODUCT NAME FIRST
      console.log(`[generateSeoText] Extracting keywords from title/description...`);
      
      const productWords = productName.toLowerCase().split(/\s+/).filter(Boolean);
      const productNameLower = productName.toLowerCase();
      
      // CRITICAL: Remove product name from the beginning of the title before extraction
      let titleForExtraction = parsed.title.trim();
      const titleForExtractionLower = titleForExtraction.toLowerCase();
      if (titleForExtractionLower.startsWith(productNameLower)) {
        // Remove product name and any trailing punctuation/whitespace
        titleForExtraction = titleForExtraction.substring(productName.length).trim();
        // Remove leading punctuation
        titleForExtraction = titleForExtraction.replace(/^[.,!?;:\s]+/, '').trim();
      }
      
      // Create a comprehensive set of product name words and ALL variations
      const productWordsSet = new Set();
      productWords.forEach(pw => {
        const pwLower = pw.toLowerCase();
        productWordsSet.add(pwLower);
        // Add plural/singular variations
        if (pwLower.length > 2) {
          productWordsSet.add(pwLower + 's');
          productWordsSet.add(pwLower + 'ing');
          productWordsSet.add(pwLower + 'ed');
          // Remove 's' if it ends with 's'
          if (pwLower.endsWith('s')) {
            productWordsSet.add(pwLower.slice(0, -1));
          }
        }
      });
      
      // Extended stop words list
      const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'are', 'was', 'been', 'have', 'will', 'would', 'should', 'could', 'can', 'may', 'must', 'shall', 'is', 'it', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'as', 'be', 'by', 'or', 'but', 'not', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'about', 'into', 'through', 'out', 'up', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'do', 'does', 'did', 'done', 'doing', 'get', 'got', 'getting', 'got', 'give', 'gave', 'given', 'giving', 'go', 'went', 'gone', 'going', 'come', 'came', 'coming', 'see', 'saw', 'seen', 'seeing', 'know', 'knew', 'known', 'knowing', 'think', 'thought', 'thinking', 'take', 'took', 'taken', 'taking', 'make', 'made', 'making', 'use', 'used', 'using', 'find', 'found', 'finding', 'say', 'said', 'saying', 'tell', 'told', 'telling', 'ask', 'asked', 'asking', 'work', 'worked', 'working', 'try', 'tried', 'trying', 'call', 'called', 'calling', 'need', 'needed', 'needing', 'want', 'wanted', 'wanting', 'help', 'helped', 'helping', 'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting', 'mean', 'meant', 'meaning', 'keep', 'kept', 'keeping', 'let', 'letting', 'begin', 'began', 'begun', 'beginning', 'seem', 'seemed', 'seeming', 'show', 'showed', 'shown', 'showing', 'hear', 'heard', 'hearing', 'play', 'played', 'playing', 'run', 'ran', 'running', 'move', 'moved', 'moving', 'like', 'liked', 'liking', 'live', 'lived', 'living', 'believe', 'believed', 'believing', 'bring', 'brought', 'bringing', 'happen', 'happened', 'happening', 'write', 'wrote', 'written', 'writing', 'sit', 'sat', 'sitting', 'stand', 'stood', 'standing', 'lose', 'lost', 'losing', 'pay', 'paid', 'paying', 'meet', 'met', 'meeting', 'include', 'included', 'including', 'continue', 'continued', 'continuing', 'set', 'setting', 'learn', 'learned', 'learning', 'change', 'changed', 'changing', 'lead', 'led', 'leading', 'understand', 'understood', 'understanding', 'watch', 'watched', 'watching', 'follow', 'followed', 'following', 'stop', 'stopped', 'stopping', 'create', 'created', 'creating', 'speak', 'spoke', 'spoken', 'speaking', 'read', 'reading', 'spend', 'spent', 'spending', 'grow', 'grew', 'grown', 'growing', 'open', 'opened', 'opening', 'walk', 'walked', 'walking', 'win', 'won', 'winning', 'teach', 'taught', 'teaching', 'offer', 'offered', 'offering', 'remember', 'remembered', 'remembering', 'consider', 'considered', 'considering', 'appear', 'appeared', 'appearing', 'buy', 'bought', 'buying', 'serve', 'served', 'serving', 'die', 'died', 'dying', 'send', 'sent', 'sending', 'build', 'built', 'building', 'stay', 'stayed', 'staying', 'fall', 'fell', 'fallen', 'falling', 'cut', 'cutting', 'reach', 'reached', 'reaching', 'kill', 'killed', 'killing', 'raise', 'raised', 'raising', 'pass', 'passed', 'passing', 'sell', 'sold', 'selling', 'decide', 'decided', 'deciding', 'return', 'returned', 'returning', 'explain', 'explained', 'explaining', 'develop', 'developed', 'developing', 'carry', 'carried', 'carrying', 'break', 'broke', 'broken', 'breaking', 'receive', 'received', 'receiving', 'agree', 'agreed', 'agreeing', 'support', 'supported', 'supporting', 'hit', 'hitting', 'produce', 'produced', 'producing', 'eat', 'ate', 'eaten', 'eating', 'cover', 'covered', 'covering', 'catch', 'caught', 'catching', 'draw', 'drew', 'drawn', 'drawing', 'choose', 'chose', 'chosen', 'choosing', 'wear', 'wore', 'worn', 'wearing', 'fight', 'fought', 'fighting', 'throw', 'threw', 'thrown', 'throwing', 'accept', 'accepted', 'accepting', 'treat', 'treated', 'treating', 'wake', 'woke', 'woken', 'waking', 'beat', 'beating', 'hang', 'hung', 'hanging', 'sing', 'sang', 'sung', 'singing', 'shoot', 'shot', 'shooting', 'save', 'saved', 'saving', 'avoid', 'avoided', 'avoiding', 'deal', 'dealt', 'dealing', 'visit', 'visited', 'visiting', 'throw', 'threw', 'thrown', 'throwing', 'worry', 'worried', 'worrying', 'finish', 'finished', 'finishing', 'prefer', 'preferred', 'preferring', 'protect', 'protected', 'protecting', 'provide', 'provided', 'providing', 'lie', 'lay', 'lain', 'lying', 'lay', 'laid', 'laying', 'suggest', 'suggested', 'suggesting', 'report', 'reported', 'reporting', 'prove', 'proved', 'proving', 'improve', 'improved', 'improving', 'claim', 'claimed', 'claiming', 'pull', 'pulled', 'pulling', 'push', 'pushed', 'pushing', 'join', 'joined', 'joining', 'press', 'pressed', 'pressing', 'manage', 'managed', 'managing', 'discover', 'discovered', 'discovering', 'check', 'checked', 'checking', 'handle', 'handled', 'handling', 'connect', 'connected', 'connecting', 'prepare', 'prepared', 'preparing', 'share', 'shared', 'sharing', 'suffer', 'suffered', 'suffering', 'describe', 'described', 'describing', 'promise', 'promised', 'promising', 'realize', 'realized', 'realizing', 'warn', 'warned', 'warning', 'wish', 'wished', 'wishing', 'wonder', 'wondered', 'wondering', 'worry', 'worried', 'worrying', 'warn', 'warned', 'warning', 'wish', 'wished', 'wishing', 'wonder', 'wondered', 'wondering']);
      
      // Helper function to check if a word is a product name word (STRICT)
      const isProductWord = (word) => {
        const wordLower = word.toLowerCase().trim();
        if (!wordLower || wordLower.length < 2) return false;
        
        // Exact match
        if (productWordsSet.has(wordLower)) return true;
        
        // Check if word contains any product word (but word must be longer)
        for (const pw of productWords) {
          const pwLower = pw.toLowerCase();
          if (wordLower.includes(pwLower) && wordLower !== pwLower && wordLower.length > pwLower.length) {
            return true;
          }
          // Check if product word contains this word (and product word is longer)
          if (pwLower.includes(wordLower) && pwLower !== wordLower && pwLower.length > wordLower.length) {
            return true;
          }
        }
        return false;
      };
      
      // Extract words from title (ONLY from the descriptive part, product name already removed)
      // Lower threshold to 3 chars to get more keywords
      const titleWords = titleForExtraction.toLowerCase()
        .split(/[\s,\.!?;:]+/)
        .map(w => w.replace(/[^a-z0-9]/g, '').trim())
        .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
      
      // Extract words from description - be more aggressive (3+ chars)
      const descWords = parsed.description.toLowerCase()
        .split(/[\s,\.!?;:]+/)
        .map(w => w.replace(/[^a-z0-9]/g, '').trim())
        .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
      
      // Remove duplicates
      const meaningfulWords = [...titleWords, ...descWords]
        .filter((w, i, arr) => arr.indexOf(w) === i);
      
      // Extract 2-word phrases from title (ONLY from descriptive part)
      const titleWordsForPhrases = titleForExtraction.toLowerCase()
        .split(/[\s,\.!?;:]+/)
        .map(w => w.replace(/[^a-z0-9]/g, '').trim())
        .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
      
      const titlePhrases = [];
      for (let i = 0; i < titleWordsForPhrases.length - 1; i++) {
        const phrase = `${titleWordsForPhrases[i]} ${titleWordsForPhrases[i + 1]}`;
        const phraseLower = phrase.toLowerCase();
        // STRICT: Reject if phrase contains product name or any product word
        if (phrase.length > 5 && 
            !phraseLower.includes(productNameLower) && 
            !productWords.some(pw => phraseLower.includes(pw.toLowerCase())) &&
            !isProductWord(phraseLower.split(' ')[0]) &&
            !isProductWord(phraseLower.split(' ')[1])) {
          titlePhrases.push(phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
      }
      
      // Extract 2-word phrases from description
      const descWordsForPhrases = parsed.description.toLowerCase()
        .split(/[\s,\.!?;:]+/)
        .map(w => w.replace(/[^a-z0-9]/g, '').trim())
        .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
      
      const descPhrases = [];
      for (let i = 0; i < descWordsForPhrases.length - 1; i++) {
        const phrase = `${descWordsForPhrases[i]} ${descWordsForPhrases[i + 1]}`;
        const phraseLower = phrase.toLowerCase();
        // STRICT: Reject if phrase contains product name or any product word
        if (phrase.length > 5 && 
            !phraseLower.includes(productNameLower) && 
            !productWords.some(pw => phraseLower.includes(pw.toLowerCase())) &&
            !isProductWord(phraseLower.split(' ')[0]) &&
            !isProductWord(phraseLower.split(' ')[1])) {
          descPhrases.push(phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
      }
      
      // Capitalize single words
      const capitalizedWords = meaningfulWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1));
      
      // Combine everything: phrases first (they're more valuable), then single words
      let extracted = [...titlePhrases, ...descPhrases, ...capitalizedWords]
        .filter((kw, i, arr) => arr.indexOf(kw) === i); // Remove duplicates
      
      // FINAL STRICT CHECK: remove any keywords that contain product name words
      extracted = extracted.filter(kw => {
        const kwLower = kw.toLowerCase();
        // Reject if keyword contains full product name
        if (kwLower.includes(productNameLower)) return false;
        // Reject if keyword contains any product word
        for (const pw of productWords) {
          if (kwLower.includes(pw.toLowerCase())) return false;
        }
        // Reject if any word in the keyword is a product word
        const kwWords = kwLower.split(/\s+/);
        for (const kwWord of kwWords) {
          if (isProductWord(kwWord)) return false;
        }
        return true;
      });
      
      // If we still don't have enough, add 3-word phrases (with strict filtering)
      if (extracted.length < 8) {
        const titleWords3 = titleForExtraction.toLowerCase()
          .split(/[\s,\.!?;:]+/)
          .map(w => w.replace(/[^a-z0-9]/g, '').trim())
          .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
        const descWords3 = parsed.description.toLowerCase()
          .split(/[\s,\.!?;:]+/)
          .map(w => w.replace(/[^a-z0-9]/g, '').trim())
          .filter(w => w.length >= 3 && !stopWords.has(w) && !isProductWord(w));
        
        for (let i = 0; i < titleWords3.length - 2; i++) {
          const phrase = `${titleWords3[i]} ${titleWords3[i + 1]} ${titleWords3[i + 2]}`;
          const phraseLower = phrase.toLowerCase();
          if (phrase.length > 8 && 
              !phraseLower.includes(productNameLower) && 
              !productWords.some(pw => phraseLower.includes(pw.toLowerCase())) &&
              !isProductWord(phraseLower.split(' ')[0]) &&
              !isProductWord(phraseLower.split(' ')[1]) &&
              !isProductWord(phraseLower.split(' ')[2])) {
            extracted.push(phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
        }
        for (let i = 0; i < descWords3.length - 2; i++) {
          const phrase = `${descWords3[i]} ${descWords3[i + 1]} ${descWords3[i + 2]}`;
          const phraseLower = phrase.toLowerCase();
          if (phrase.length > 8 && 
              !phraseLower.includes(productNameLower) && 
              !productWords.some(pw => phraseLower.includes(pw.toLowerCase())) &&
              !isProductWord(phraseLower.split(' ')[0]) &&
              !isProductWord(phraseLower.split(' ')[1]) &&
              !isProductWord(phraseLower.split(' ')[2])) {
            extracted.push(phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
        }
        extracted = extracted.filter((kw, i, arr) => arr.indexOf(kw) === i); // Remove duplicates
      }
      
      // ALWAYS ensure we have at least 6 keywords - use generic fallbacks if needed
      // But only if we truly don't have enough extracted keywords
      if (extracted.length < 6) {
        // Use very generic fallbacks that work for any product type
        const genericFallbacks = ["Quality Products", "Premium Items", "Professional Grade", "High Quality", "Durable Products", "Reliable Items", "Well Made", "Expert Recommended", "Customer Favorite", "Popular Choice"];
        extracted = [...extracted, ...genericFallbacks].filter((kw, i, arr) => arr.indexOf(kw) === i);
      }
      
      // Final keywords - take up to 12
      let keywords = extracted.slice(0, 12);
      
      // ABSOLUTE FINAL CHECK: Remove product name if it somehow got through
      keywords = keywords.filter(kw => {
        const kwLower = kw.toLowerCase().trim();
        // Reject if keyword is exactly the product name
        if (kwLower === productNameLower) return false;
        // Reject if keyword contains the full product name
        if (kwLower.includes(productNameLower)) return false;
        // Reject if all words in keyword are product name words
        const kwWords = kwLower.split(/\s+/);
        const allProductWords = kwWords.every(word => isProductWord(word));
        if (allProductWords) return false;
        return true;
      });
      
      // If we filtered out too many, add more generic fallbacks
      if (keywords.length < 6) {
        const moreFallbacks = ["Quality Products", "Premium Items", "Professional Grade", "High Quality", "Durable Products", "Reliable Items", "Well Made", "Expert Recommended", "Customer Favorite", "Popular Choice", "Specialty Products", "Premium Quality"];
        keywords = [...keywords, ...moreFallbacks]
          .filter((kw, i, arr) => arr.indexOf(kw) === i)
          .slice(0, 12);
      }
      
      // FINAL VALIDATION: Ensure product name is NEVER in keywords
      keywords = keywords.filter(kw => {
        const kwLower = kw.toLowerCase();
        return kwLower !== productNameLower && !kwLower.includes(productNameLower);
      });
      
      console.log(`[generateSeoText] Final keywords (${keywords.length}):`, keywords);
      console.log(`[generateSeoText] Product name: "${productName}", Title for extraction: "${titleForExtraction}"`);
      console.log(`[generateSeoText] Extracted ${extracted.length} keywords before final filtering`);

      const result = {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        keywords: keywords
      };

      console.log(`[generateSeoText] Successfully generated for "${productName}":`, {
        title: result.title.substring(0, 80),
        titleLength: result.title.length,
        descLength: result.description.length,
        keywordsCount: result.keywords.length,
        generationId: generationId,
        variationNumber: variationNumber
      });

      return result;
    } catch (error) {
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        // Enhanced error handling for API key issues
        if (error.code === "invalid_api_key" || error.status === 401) {
          console.error("\n❌ API Key Error Details:");
          console.error("Key length:", apiKey.length);
          console.error("Key starts with:", apiKey.substring(0, 10));
          console.error("Key ends with:", apiKey.substring(apiKey.length - 4));
          console.error("\n💡 Troubleshooting steps:");
          console.error("1. Go to https://platform.openai.com/api-keys");
          console.error("2. Verify your API key is active (not revoked)");
          console.error("3. Check your billing: https://platform.openai.com/account/billing");
          console.error("4. Make sure you have credits/quota available");
          console.error("5. Try creating a NEW API key and updating .env\n");
        }
        console.error(`[generateSeoText] Failed after ${retries + 1} attempts for "${productName}":`, error.message);
        throw error;
      }
      // Otherwise, continue to next retry
      console.warn(`[generateSeoText] Attempt ${attempt + 1} failed for "${productName}", retrying...`, error.message);
    }
  }
  
  // This should never be reached, but just in case
  throw new Error("Failed to generate SEO text after all retries");
}
