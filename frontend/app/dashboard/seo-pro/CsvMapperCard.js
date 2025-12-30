"use client";

export default function ColumnMapper({ columns, onMap }) {
  return (
    <div style={{ marginTop: "16px" }}>
      {columns.map(col => (
        <div key={col} style={{ marginBottom: "8px" }}>
          <label style={{ marginRight: "8px" }}>{col}</label>
          <input
            type="text"
            placeholder="Map to field"
            onChange={e => onMap(col, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
