import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testGenerate() {
  console.log("\n--- Testing /generate ---");
  try {
    const res = await fetch(`${BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Best hiking backpacks for beginners",
        length: 160
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error testing /generate:", err.message);
  }
}

async function testTitle() {
  console.log("\n--- Testing /title ---");
  try {
    const res = await fetch(`${BASE_URL}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Affordable home office desks"
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error testing /title:", err.message);
  }
}

async function testKeywords() {
  console.log("\n--- Testing /keywords ---");
  try {
    const res = await fetch(`${BASE_URL}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Wireless earbuds for gaming"
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error testing /keywords:", err.message);
  }
}

// Run all tests in sequence
async function runTests() {
  await testGenerate();
  await testTitle();
  await testKeywords();
  console.log("\nAll tests completed.\n");
}

runTests();
