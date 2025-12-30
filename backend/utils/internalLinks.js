export function suggestInternalLinks(topics = []) {
  return topics.map(t => ({
    anchor: t,
    url: `/blog/${t.toLowerCase().replace(/\s+/g, "-")}`
  }));
}
