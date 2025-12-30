"use client";

export default function CsvExport({ rows, filename = "seo.csv" }) {
  function download() {
    if (!rows?.length) return;

    const csv = rows.map(r =>
      `"${Object.values(r).map(v => String(v).replace(/"/g, '""')).join('","')}"`
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  return <button onClick={download}>Download CSV</button>;
}
