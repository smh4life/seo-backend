import fetch from "node-fetch";

const API_KEY = "AIzaSyA_pX_SMKUmPusYrn7Jm36acgw886GS5WE"; 
const MODEL = "gemini-2.5-flash-preview-09-2025";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testRawPrompt() {
  const prompt = "Give me a JSON object: {\"message\": \"hello\"}";

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const raw = await res.text();
    console.log("\nRaw API response:\n", raw);
  } catch (err) {
    console.error("Error calling Gemini:", err.message);
  }
}

testRawPrompt();
