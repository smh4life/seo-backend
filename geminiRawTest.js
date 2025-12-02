import fetch from "node-fetch";

const API_KEY = "AIzaSyA_pX_SMKUmPusYrn7Jm36acgw886GS5WE";  // keep your key confidential

// Simple raw prompt to bypass JSON, rules, formatting, etc.
const prompt = "Write an SEO title for winter jackets.";

async function testGeminiRaw() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    console.log("RAW GEMINI RESPONSE:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  }
}

testGeminiRaw();
