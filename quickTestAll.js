import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testServerOnline() {
  try {
    const res = await fetch(BASE_URL);
    console.log("Server Online:", res.status === 200 ? "OK" : res.status);
  } catch (err) {
    console.log("Server Online test failed:", err.message);
  }
}

async function testGenerate() {
  const body = { topic: "SEO optimization", length: 150 };
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log("/generate response:", data);
}

async function testTitle() {
  const body = { topic: "SEO optimization" };
  const res = await fetch(`${BASE_URL}/title`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log("/title response:", data);
}

async function testKeywords() {
  const body = { topic: "SEO optimization" };
  const res = await fetch(`${BASE_URL}/keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log("/keywords response:", data);
}

async function testDirectGemini() {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Test", length: 50 }),
  });
  const data = await res.json();
  console.log("Direct Gemini API test:", data);
}

async function runAllTests() {
  console.log("##### QUICK TEST ALL STARTED #####\n");
  await testServerOnline();
  await testGenerate();
  await testTitle();
  await testKeywords();
  await testDirectGemini();
  console.log("\n##### ALL TESTS COMPLETED #####");
}

runAllTests();
