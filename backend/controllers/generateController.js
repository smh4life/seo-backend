import { generateProductJSONLD } from "../utils/jsonld.js";
import { suggestInternalLinks } from "../utils/internalLinks.js";
import { titlePx, descriptionPx } from "../utils/measurePx.js";
import { generateSeoText } from "../services/seoai.js";

// Function to trim text at word boundaries to fit pixel limit and get as close as possible
function trimToFit(text, targetPx, measureFn) {
  let trimmed = text.trim();
  let currentPx = measureFn(trimmed);
  
  // If it fits, try to expand it to get closer to target
  if (currentPx <= targetPx) {
    // Try adding words from the original if available
    const words = text.trim().split(/\s+/);
    const currentWords = trimmed.split(/\s+/);
    
    // If we have more words available, try adding them
    if (words.length > currentWords.length) {
      for (let i = currentWords.length; i < words.length; i++) {
        const testText = trimmed + " " + words[i];
        const testPx = measureFn(testText);
        if (testPx <= targetPx) {
          trimmed = testText;
          currentPx = testPx;
        } else {
          break;
        }
      }
    }
    
    // Ensure it ends with punctuation
    if (!/[.!?]$/.test(trimmed)) {
      const withPeriod = trimmed + ".";
      if (measureFn(withPeriod) <= targetPx) {
        trimmed = withPeriod;
        currentPx = measureFn(trimmed);
      }
    }
    
    return trimmed;
  }
  
  // If too long, find the last complete sentence that fits
  // First, try to find sentences (split by . ! ?)
  const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length > 0) {
    // Try adding sentences from the start until we hit the limit
    let result = "";
    for (const sentence of sentences) {
      const testText = result + (result ? " " : "") + sentence.trim();
      const testPx = measureFn(testText);
      
      if (testPx <= targetPx) {
        result = testText;
      } else {
        break;
      }
    }
    
    // If we have at least one complete sentence, use it
    if (result) {
      // Ensure it ends with punctuation
      if (!/[.!?]$/.test(result)) {
        result = result + ".";
      }
      return result;
    }
  }
  
  // If no sentences found or all too long, trim word by word
  const words = trimmed.split(/\s+/);
  if (words.length === 0) return trimmed;
  
  let result = words[0];
  currentPx = measureFn(result);
  
  // Add words one by one until we hit the limit
  for (let i = 1; i < words.length; i++) {
    const testText = result + " " + words[i];
    const testPx = measureFn(testText);
    
    if (testPx <= targetPx) {
      result = testText;
      currentPx = testPx;
    } else {
      break;
    }
  }
  
  // Ensure it ends with exactly one period and doesn't end mid-word
  result = result.replace(/[.!?]+$/, ""); // Remove all trailing punctuation
  
  // Check if it ends with incomplete words (like "and", "the", "for" without a period)
  const resultWords = result.split(/\s+/);
  const lastWord = resultWords[resultWords.length - 1];
  
  // If the last word is a short connector word and we're close to the limit, remove it
  const shortConnectors = ["and", "the", "for", "with", "from", "that", "this", "but", "or"];
  if (shortConnectors.includes(lastWord.toLowerCase()) && resultWords.length > 1) {
    resultWords.pop();
    result = resultWords.join(" ");
  }
  
  const withPeriod = result + ".";
  if (measureFn(withPeriod) <= targetPx) {
    result = withPeriod;
  } else {
    // If period doesn't fit, remove last word and add period
    const resultWords = result.split(/\s+/);
    if (resultWords.length > 1) {
      resultWords.pop();
      result = resultWords.join(" ") + ".";
      // If still too long, keep removing words
      while (resultWords.length > 0 && measureFn(result) > targetPx) {
        resultWords.pop();
        result = resultWords.join(" ") + ".";
      }
    } else {
      // Single word - just add period even if slightly over
      result = result + ".";
    }
  }
  
  return result;
}

// Function to optimize title to get closer to target pixel width
function optimizeTitle(title, targetPx) {
  let t = title.trim();
  
  // Remove any trailing punctuation first
  t = t.replace(/[.!?]+$/, "");
  
  // CRITICAL: First, ensure we're not already over the limit
  let initialPx = titlePx(t);
  if (initialPx > targetPx) {
    console.log(`[optimizeTitle] WARNING: Initial title exceeds limit (${initialPx}px > ${targetPx}px), trimming immediately...`);
    t = trimToFit(t, targetPx, titlePx);
    initialPx = titlePx(t);
    // If still over after trimToFit, manually trim
    if (initialPx > targetPx) {
      const words = t.split(/\s+/);
      let trimmed = words[0];
      for (let i = 1; i < words.length; i++) {
        const testText = trimmed + " " + words[i];
        if (titlePx(testText) <= targetPx) {
          trimmed = testText;
        } else {
          break;
        }
      }
      t = trimmed;
    }
  }
  
  // Trim to fit using word boundaries (safety check)
  t = trimToFit(t, targetPx, titlePx);
  
  // Remove trailing punctuation again after trimToFit
  t = t.replace(/[.!?]+$/, "");
  
  let currentPx = titlePx(t);
  
  // CRITICAL: Verify we're still under limit after trimToFit
  if (currentPx > targetPx) {
    console.log(`[optimizeTitle] ERROR: Still over limit after trimToFit (${currentPx}px > ${targetPx}px), forcing trim...`);
    const words = t.split(/\s+/);
    t = words[0];
    for (let i = 1; i < words.length; i++) {
      const testText = t + " " + words[i];
      if (titlePx(testText) <= targetPx) {
        t = testText;
      } else {
        break;
      }
    }
    currentPx = titlePx(t);
  }
  
  // Try to expand it to get as close as possible to target (MAXIMIZE pixel usage)
  // CRITICAL: Aim for the target itself (580px), not just 99.5% of it
  // Try to get within 1-2px of target for maximum usage
  const targetMin = targetPx - 2; // Aim for within 2px of target (578px for 580px target)
  const additions = [
    " for maximum performance and reliability.",
    " with premium features and superior quality.",
    " designed for professionals and experts.",
    " built to last with exceptional durability.",
    " trusted by experts worldwide for quality.",
    " for superior results and performance.",
    " with advanced technology and innovation.",
    " crafted for excellence and precision.",
    " engineered for durability and longevity.",
    " perfect for everyday use and convenience.",
    " offering exceptional value and quality.",
    " with innovative design and functionality.",
    " for enhanced performance and efficiency.",
    " delivering superior quality and reliability.",
    " with professional-grade features and capabilities.",
    " combining quality craftsmanship with modern design.",
    " featuring cutting-edge technology and innovation.",
    " designed to exceed expectations and deliver results.",
    " providing exceptional value and performance.",
    " with superior quality and reliable performance.",
    " engineered for maximum efficiency and durability.",
    " designed for optimal performance and results.",
    " featuring premium materials and expert craftsmanship.",
    " with industry-leading quality and reliability.",
    " designed for maximum comfort and performance.",
    " offering superior durability and long-lasting value.",
    " with professional-grade construction and design.",
    " engineered for exceptional performance and reliability.",
    " featuring innovative technology and superior quality.",
    " designed to deliver outstanding results consistently.",
  ];
  
  // Shuffle additions RANDOMLY to ensure variety (not deterministic)
  const shuffledAdditions = [...additions].sort(() => Math.random() - 0.5);
  
  // Track which additions we've used to avoid repetition
  const usedAdditions = new Set();
  
  // Try adding phrases to get closer to target - be EXTREMELY aggressive and persistent
  let attempts = 0;
  let maxAttempts = shuffledAdditions.length * 3; // Try multiple rounds
  let lastPx = currentPx;
  let noProgressCount = 0;
  
  while (currentPx < targetMin && attempts < maxAttempts) {
    let bestAddition = null;
    let bestPx = currentPx;
    
    // Find ALL good additions (not just the single best) and pick randomly
    const goodAdditions = [];
    for (const addition of shuffledAdditions) {
      // Skip if we've already used this addition (but allow reuse if we're making progress)
      if (usedAdditions.has(addition) && noProgressCount < 2) continue;
      
      // Skip if this phrase already appears in the title (avoid repetition)
      const additionText = addition.trim().toLowerCase();
      if (t.toLowerCase().includes(additionText)) continue;
      
      const cleanTitle = t.replace(/[.!?]+$/, "");
      const testTitle = cleanTitle + addition;
      const testPx = titlePx(testTitle);
      if (testPx <= targetPx && testPx > currentPx) {
        goodAdditions.push({ addition, px: testPx });
      }
    }
    
    // If we have good options, pick randomly from the top 3 (or all if less than 3)
    if (goodAdditions.length > 0) {
      // Sort by pixel count (best first)
      goodAdditions.sort((a, b) => b.px - a.px);
      // Pick randomly from top 3 options (or all if less than 3)
      const topOptions = goodAdditions.slice(0, Math.min(3, goodAdditions.length));
      const randomPick = topOptions[Math.floor(Math.random() * topOptions.length)];
      
      bestAddition = randomPick.addition;
      bestPx = randomPick.px;
    }
    
    if (bestAddition) {
      t = t.replace(/[.!?]+$/, "") + bestAddition;
      currentPx = bestPx;
      usedAdditions.add(bestAddition); // Mark as used
      noProgressCount = 0; // Reset no progress counter
      // Only break if we're very close to target (within 2px for maximum usage)
      if (currentPx >= targetPx - 2) {
        break;
      }
    } else {
      // No progress - allow reuse of additions if we're still far from target
      if (currentPx === lastPx) {
        noProgressCount++;
        if (noProgressCount >= 3) {
          break; // Give up if no progress after 3 attempts
        }
        // Clear used additions to allow reuse
        usedAdditions.clear();
      }
    }
    
    lastPx = currentPx;
    attempts++;
  }
  
  // If still not close enough, try adding shorter phrases (shuffled based on title)
  if (currentPx < targetMin) {
    const shortAdditions = [
      " for professionals.",
      " with quality.",
      " built to last.",
      " trusted choice.",
      " premium quality.",
      " expert approved.",
      " industry leading.",
      " proven reliable.",
    ];
    
    // Shuffle RANDOMLY to ensure variety
    const shuffledShort = [...shortAdditions].sort(() => Math.random() - 0.5);
    
    for (const addition of shuffledShort) {
      const cleanTitle = t.replace(/[.!?]+$/, "");
      const testTitle = cleanTitle + addition;
      const testPx = titlePx(testTitle);
      if (testPx <= targetPx && testPx > currentPx) {
        t = testTitle;
        currentPx = testPx;
        if (currentPx >= targetPx - 2) break; // Aim for within 2px of target
      }
    }
  }
  
  // Final optimization: if we're close but not at target, try adding single words
  if (currentPx < targetPx - 2) {
    // Try adding single descriptive words that might fit
    const singleWords = ["quality", "premium", "professional", "expert", "advanced", "superior", "reliable", "durable", "excellent", "outstanding", "proven", "tested", "certified", "approved"];
    for (const word of singleWords) {
      const cleanTitle = t.replace(/[.!?]+$/, "");
      const testTitle = cleanTitle + " " + word + ".";
      const testPx = titlePx(testTitle);
      if (testPx <= targetPx && testPx > currentPx) {
        t = testTitle;
        currentPx = testPx;
        if (currentPx >= targetPx - 2) break;
      }
    }
    
    // If still not close, try adding meaningful short phrases (removed meaningless ones like "now", "today", etc.)
    if (currentPx < targetPx - 2) {
      const microAdditions = [" and more.", " available."];
      for (const addition of microAdditions) {
        const cleanTitle = t.replace(/[.!?]+$/, "");
        const testTitle = cleanTitle + addition;
        const testPx = titlePx(testTitle);
        if (testPx <= targetPx && testPx > currentPx) {
          t = testTitle;
          currentPx = testPx;
          if (currentPx >= targetPx - 2) break;
        }
      }
    }
  }
  
  // Log final pixel count for debugging
  console.log(`[optimizeTitle] Before final check: ${currentPx}px / ${targetPx}px target`);
  
  // Final cleanup: ensure it ends with exactly one period
  t = t.replace(/[.!?]+$/, "") + ".";
  
  // CRITICAL: Final safety check - NEVER exceed the target limit
  // Check BEFORE adding the period
  let finalPx = titlePx(t);
  if (finalPx > targetPx) {
    console.log(`[optimizeTitle] WARNING: Title exceeds limit before period (${finalPx}px > ${targetPx}px), trimming...`);
    // We're over - trim it back to fit using trimToFit
    t = trimToFit(t, targetPx, titlePx);
    // Re-check after trim
    finalPx = titlePx(t);
    
    // If still over after trimToFit, manually trim word by word
    if (finalPx > targetPx) {
      const words = t.split(/\s+/);
      let trimmed = words[0];
      for (let i = 1; i < words.length; i++) {
        const testText = trimmed + " " + words[i];
        if (titlePx(testText) <= targetPx) {
          trimmed = testText;
        } else {
          break;
        }
      }
      t = trimmed;
      finalPx = titlePx(t);
    }
  }
  
  // Now add period, but check if it fits
  const withPeriod = t.replace(/[.!?]+$/, "") + ".";
  const periodPx = titlePx(withPeriod);
  if (periodPx <= targetPx) {
    t = withPeriod;
    finalPx = periodPx;
  } else {
    // Period doesn't fit, keep without it
    t = t.replace(/[.!?]+$/, "");
    finalPx = titlePx(t);
  }
  
  console.log(`[optimizeTitle] Final result: ${finalPx}px / ${targetPx}px target`);
  
  // Final verification - should NEVER exceed
  if (titlePx(t) > targetPx) {
    console.error(`[optimizeTitle] CRITICAL ERROR: Title still exceeds limit! ${titlePx(t)}px > ${targetPx}px`);
    // Last resort: use just the first word
    const firstWord = t.split(/\s+/)[0];
    t = firstWord;
    if (titlePx(t) > targetPx) {
      // Even first word is too long - truncate it
      let truncated = "";
      for (let i = 0; i < firstWord.length; i++) {
        if (titlePx(truncated + firstWord[i]) <= targetPx) {
          truncated += firstWord[i];
        } else {
          break;
        }
      }
      t = truncated || firstWord.substring(0, 10); // Fallback to first 10 chars
    }
    console.error(`[optimizeTitle] Emergency fallback result: "${t}" (${titlePx(t)}px)`);
  }
  
  return t;
}

// Function to optimize description to get closer to target pixel width
function optimizeDescription(description, targetPx) {
  let desc = description.trim();
  
  // Remove any trailing punctuation first
  desc = desc.replace(/[.!?]+$/, "");
  
  // Trim to fit using word boundaries
  desc = trimToFit(desc, targetPx, descriptionPx);
  
  // Remove trailing punctuation again after trimToFit (it might add a period)
  desc = desc.replace(/[.!?]+$/, "");
  
  let currentPx = descriptionPx(desc);
  
  // Try to expand it to get as close as possible to target (aim for 99.5-100% of target)
  const targetMin = targetPx * 0.995; // Aim for at least 99.5% of target (985px for 990px target)
  const additions = [
    " Ideal for various applications.",
    " Perfect for everyday use.",
    " Designed for maximum performance.",
    " Suitable for all skill levels.",
    " Built to last.",
    " Available in multiple options.",
    " Easy to use and maintain.",
    " Trusted by professionals.",
    " Offers exceptional quality and durability.",
    " Provides reliable performance in various conditions.",
    " Crafted with attention to detail.",
    " Delivers consistent results every time.",
    " Backed by years of expertise.",
    " Made from premium materials.",
    " Engineered for long-lasting use.",
    " Combines functionality with style.",
    " Designed to meet your specific needs.",
    " Experience the difference with this quality product.",
    " Discover why customers choose this option.",
    " Provides excellent value and performance.",
    " Features user-friendly design elements.",
    " Offers versatile application options.",
    " Ensures reliable operation over time.",
    " Designed with user comfort in mind.",
    " Delivers outstanding results consistently.",
  ];
  
  // Track which additions we've used to avoid repetition
  const usedAdditions = new Set();
  
  // Try adding phrases to get closer to target - be more aggressive
  let attempts = 0;
  while (currentPx < targetMin && attempts < additions.length) {
    let bestAddition = null;
    let bestPx = currentPx;
    
    // Find the best addition that gets us closest to target (and hasn't been used)
    for (const addition of additions) {
      // Skip if we've already used this addition
      if (usedAdditions.has(addition)) continue;
      
      // Skip if this phrase already appears in the description (avoid repetition)
      const additionText = addition.trim().toLowerCase();
      if (desc.toLowerCase().includes(additionText)) continue;
      
      const cleanDesc = desc.replace(/[.!?]+$/, "");
      const testDesc = cleanDesc + addition;
      const testPx = descriptionPx(testDesc);
      if (testPx <= targetPx && testPx > bestPx) {
        bestAddition = addition;
        bestPx = testPx;
      }
    }
    
    if (bestAddition) {
      desc = desc.replace(/[.!?]+$/, "") + bestAddition;
      currentPx = bestPx;
      usedAdditions.add(bestAddition); // Mark as used
      // Only break if we're very close to target (within 3px for precision)
      if (currentPx >= targetPx - 3) {
        break;
      }
    } else {
      break; // No more additions fit
    }
    
    attempts++;
  }
  
  // If still not close enough, try adding shorter phrases
  if (currentPx < targetMin) {
    const shortAdditions = [
      " Built to last.",
      " Trusted by professionals.",
      " Easy to use.",
      " Premium quality.",
      " Professional grade.",
      " Designed for excellence.",
      " Superior performance.",
      " Quality craftsmanship.",
    ];
    
    for (const addition of shortAdditions) {
      const cleanDesc = desc.replace(/[.!?]+$/, "");
      const testDesc = cleanDesc + addition;
      const testPx = descriptionPx(testDesc);
      if (testPx <= targetPx && testPx > currentPx) {
        desc = testDesc;
        currentPx = testPx;
        if (currentPx >= targetPx - 3) break;
      }
    }
  }
  
  // Final cleanup: ensure it ends with exactly one period
  desc = desc.replace(/[.!?]+$/, "") + ".";
  
  return desc;
}

export async function generateSingle(req, res) {
  const topic = req.body.topic?.trim();
  const productDescription = req.body.description?.trim(); // Optional product description for context
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  try {
    // Generate AI-powered SEO text
    console.log(`\n[generateSingle] ===== Starting generation for topic: "${topic}" =====`);
    if (productDescription) {
      console.log(`[generateSingle] Using product description for context: "${productDescription.substring(0, 100)}..."`);
    }
    const aiResult = await generateSeoText(topic, 0, productDescription);
    console.log(`[generateSingle] AI result received:`, { 
      title: aiResult.title?.substring(0, 50), 
      description: aiResult.description?.substring(0, 50),
      keywordsCount: aiResult.keywords?.length || 0
    });
    
    if (!aiResult || !aiResult.title || !aiResult.description) {
      console.error("[generateSingle] AI returned invalid result:", aiResult);
      throw new Error("AI returned empty or invalid title/description");
    }
    
    // Check if AI just returned the topic (which means it failed)
    if (aiResult.title.trim().toLowerCase() === topic.toLowerCase() || 
        aiResult.description.trim().toLowerCase() === topic.toLowerCase()) {
      console.warn(`[generateSingle] WARNING: AI returned topic as result - this indicates a problem`);
    }
    
    let title = aiResult.title;
    let description = aiResult.description; // AI-generated description (different from productDescription above)
    
    // Log the raw AI response to check if AI is generating unique titles
    console.log(`[generateSingle] RAW AI TITLE (before optimization): "${title}"`);
    
    // Clean up any weird text artifacts (like "nnnnnnnn", "nn", etc.)
    title = title.replace(/n{2,}/gi, "").replace(/\s+/g, " ").trim();
    description = description.replace(/n{2,}/gi, "").replace(/\s+/g, " ").trim();
    // Remove any repeated phrases (clean up AI repetition)
    description = description.replace(/([^.!?]+)(\s+\1)+/gi, "$1").trim();
    // Remove trailing "nn" or similar artifacts
    description = description.replace(/n{2,}$/gi, "").trim();

    // Optimize title to get closer to 580px target
    // CRITICAL: Frontend measurement is higher than backend, so optimize to lower target
    // Frontend shows ~660px when backend shows 565px (ratio ~1.168)
    // To ensure frontend shows <= 580px, backend should optimize to ~497px
    // Using 500px as safe target to account for measurement differences
    const titleBeforeOpt = titlePx(title);
    const titleBeforeOptText = title; // Save before optimization
    title = optimizeTitle(title, 500); // Optimize to 500px backend = ~580px frontend
    const titleAfterOpt = titlePx(title);
    
    console.log(`[generateSingle] Title before optimization: "${titleBeforeOptText}" (${titleBeforeOpt}px)`);
    console.log(`[generateSingle] Title after optimization: "${title}" (${titleAfterOpt}px)`);

    // Optimize description to get closer to 990px target
    description = optimizeDescription(description, 990);

    console.log(`[generateSingle] Title optimization:`, {
      before: `${titleBeforeOpt}px`,
      after: `${titleAfterOpt}px / 580px target`,
      title: title.substring(0, 80)
    });

    // Validate keywords - ensure we have proper keywords, not just topic split
    let keywords = aiResult.keywords;
    if (!keywords || !Array.isArray(keywords) || keywords.length < 5) {
      console.warn(`[generateSingle] Invalid keywords from AI, got:`, keywords);
      // Don't fallback to topic split - this indicates an AI issue
      keywords = Array.isArray(keywords) ? keywords : [];
    }

    // Include free usage info if user is not authenticated
    const response = {
      title,
      description,
      keywords: keywords
    };
    
    if (!req.user && req.freeUsageRemaining !== undefined) {
      response.freeUsageRemaining = req.freeUsageRemaining;
      response.freeUsageLimit = 5;
    }
    
    res.json(response);
  } catch (error) {
    console.error("\n[generateSingle] ===== AI GENERATION FAILED ===== ");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Falling back to topic-based generation\n");
    
    // Fallback to simple generation if AI fails
    let title = topic;
    let description = `${topic}.`;

    // Optimize title to get closer to 580px target (frontend)
    // Backend optimizes to 500px to account for frontend showing higher values
    title = optimizeTitle(title, 500);

    // Optimize description to get closer to 990px target
    description = optimizeDescription(description, 990);

    // In fallback, use generic keywords - NEVER use the topic/product name
    const fallbackKeywords = ["Quality Products", "Premium Items", "Professional Grade", "High Quality", "Durable Products", "Reliable Items", "Well Made", "Expert Recommended"];
    // Include free usage info if user is not authenticated
    const response = {
      title,
      description,
      keywords: fallbackKeywords
    };
    
    if (!req.user && req.freeUsageRemaining !== undefined) {
      response.freeUsageRemaining = req.freeUsageRemaining;
      response.freeUsageLimit = 5;
    }
    
    res.json(response);
  }
}

export async function generateBatch(req, res) {
  const topics = req.body.topics || [];

  try {
    // Generate AI-powered SEO text for each topic
    const results = await Promise.all(
      topics.map(async (t) => {
        try {
          const aiResult = await generateSeoText(t);
          
               let title = aiResult.title || t;
               let description = aiResult.description || `${t}.`;

               // Optimize title to get closer to 580px target
               title = optimizeTitle(title, 500); // Optimize to 500px backend = ~580px frontend

               // Optimize description to get closer to 990px target
               description = optimizeDescription(description, 990);

          // Use proper fallback keywords if AI didn't return keywords - NEVER use topic
          const fallbackKeywords = ["Personal Care", "Intimate Products", "Wellness", "Care Products", "Health Products", "Personal Items"];
          return {
            topic: t,
            title,
            description,
            keywords: aiResult.keywords && Array.isArray(aiResult.keywords) && aiResult.keywords.length > 0 
              ? aiResult.keywords 
              : fallbackKeywords
          };
        } catch (error) {
          console.error(`AI generation error for topic "${t}":`, error);
               // Fallback to simple generation if AI fails for this topic
               let title = t;
               let description = `${t}.`;

               // Optimize title to get closer to 580px target
               title = optimizeTitle(title, 500); // Optimize to 500px backend = ~580px frontend

               // Optimize description to get closer to 990px target
               description = optimizeDescription(description, 990);

          // Use proper fallback keywords - NEVER use topic/product name
          const fallbackKeywords = ["Personal Care", "Intimate Products", "Wellness", "Care Products", "Health Products", "Personal Items"];
          return {
            topic: t,
            title,
            description,
            keywords: fallbackKeywords
          };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    console.error("Batch generation error:", error);
    res.status(500).json({ error: "Batch generation failed" });
  }
}

export async function generateSeoPro(req, res) {
  res.json({
    jsonld: generateProductJSONLD(req.body),
    internalLinks: suggestInternalLinks([])
  });
}
