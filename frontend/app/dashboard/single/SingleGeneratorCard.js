"use client";

import { useState } from "react";
import { apiPost } from "../../../lib/api";
import GeneratorCard from "../../../components/GeneratorCard";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ErrorState from "../../../components/ErrorState";

export default function SingleGeneratorCard() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    if (!topic) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiPost("/generate/single", { topic });
      setResult(data);
    } catch {
      setError("Failed to generate content.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GeneratorCard title="Single Generator">
      <input
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic"
        style={{ width: "100%", padding: "12px" }}
      />

      <button onClick={generate} style={{ marginTop: "12px" }}>
        Generate
      </button>

      {loading && <LoadingSpinner />}
      {error && <ErrorState message={error} />}

      {result && (
        <div style={{ marginTop: "16px" }}>
          <div><strong>Title:</strong> {result.title}</div>
          <div><strong>Description:</strong> {result.description}</div>
          <div><strong>Keywords:</strong> {result.keywords.join(", ")}</div>
        </div>
      )}
    </GeneratorCard>
  );
}
