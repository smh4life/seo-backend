import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// --------------------------
// File System Setup
// --------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // optional if you use a public folder

// ============================
// 🔑 API Keys (environment variables)
// ============================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!GEMINI_API_KEY) console.warn("⚠️ Missing GEMINI_API_KEY");
if (!OPENAI_API_KEY) console.warn("⚠️ Missing OPENAI_API_KEY");

// ============================
// 📌 Utility: Remove code fences + fix JSON
// ============================
function cleanJson(raw) {
    if (!raw) return null;

    let cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    // Attempt to parse JSON safely
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("JSON parse error:", err);
        return null;
    }
}

// ============================
// 📌 Utility: Build system prompt for both models
// ============================
const SYSTEM_TEXT = `
You are an expert SEO generator. 
Return ONLY a JSON object with:

{
  "title": "",
  "description": "",
  "keywords": ""
}

- Title UNDER 60 characters
- Description under 1000px/160 characters
- Keywords as a comma-separated list
DO NOT add Markdown, DO NOT add commentary.
STRICT JSON ONLY.
`;

// ============================
// 🤖 1) Gemini Request
// ============================
async function callGemini(topic, maxLength) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_TEXT }] },
        contents: [
            {
                parts: [
                    {
                        text: `Generate SEO metadata for topic: "${topic}". 
Meta description target length: ${maxLength} pixels/characters.`
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    keywords: { type: "STRING" }
                },
                required: ["title", "description", "keywords"]
            }
        }
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return cleanJson(text);
}

// ============================
// 🤖 2) OpenAI Fallback Request
// ============================
async function callOpenAI(topic, maxLength) {
    const url = "https://api.openai.com/v1/chat/completions";

    const payload = {
        model: "gpt-4.1-mini",
        messages: [
            { role: "system", content: SYSTEM_TEXT },
            {
                role: "user",
                content: `Generate SEO metadata for topic: "${topic}" with description target length ${maxLength}.`
            }
        ],
        response_format: { type: "json_object" }
    };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content
        ? JSON.parse(data.choices[0].message.content)
        : null;
}

// ============================
// 🚀 POST /generate (MAIN ENDPOINT)
// ============================
app.post("/generate", async (req, res) => {
    const { topic, maxLength } = req.body;

    if (!topic) {
        return res.status(400).json({ error: "Missing topic" });
    }

    let result = null;

    try {
        console.log("🟦 Trying Gemini...");
        result = await callGemini(topic, maxLength);

        if (!result) {
            console.log("🟧 Gemini returned invalid JSON. Trying OpenAI fallback...");
            result = await callOpenAI(topic, maxLength);
        }

        if (!result) {
            throw new Error("Both Gemini and OpenAI failed to return valid JSON");
        }

        // Final cleanup
        result.title = result.title?.trim() || "N/A";
        result.description = result.description?.trim() || "N/A";
        result.keywords = result.keywords?.trim() || "N/A";

        return res.json(result);

    } catch (err) {
        console.error("❌ /generate ERROR:", err);
        return res.status(500).json({
            error: "Failed to generate SEO content",
            details: err.message
        });
    }
});

// ============================
// 🌍 Default: Serve Frontend
// ============================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "seo-app.html"));
});

// ============================
// 🚀 START SERVER
// ============================
app.listen(PORT, () => {
    console.log(`✅ SEO backend running on http://localhost:${PORT}`);
});
