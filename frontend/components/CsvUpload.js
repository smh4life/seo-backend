"use client";

export default function CsvUpload({ onLoad }) {
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onLoad(reader.result);
    reader.readAsText(file);
  }

  return <input type="file" accept=".csv" onChange={handleFile} />;
}
