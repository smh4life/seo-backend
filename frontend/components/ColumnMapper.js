"use client";

export default function ColumnMapper({ columns = [], onMap }) {
  return (
    <div>
      <h4>Column Mapping</h4>
      {columns.map(col => (
        <div key={col}>
          <label>{col}</label>
          <select onChange={e => onMap(col, e.target.value)}>
            <option value="">Ignore</option>
            <option value="title">Title</option>
            <option value="description">Description</option>
            <option value="keywords">Keywords</option>
          </select>
        </div>
      ))}
    </div>
  );
}
