"use client";

export default function InternalLinksPreview({ links = [] }) {
  if (!links.length) return null;

  return (
    <div style={{ marginTop: "16px" }}>
      <h4>Suggested Internal Links</h4>
      <ul>
        {links.map((l, i) => (
          <li key={i}>
            <a href={l.url}>{l.anchor}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
