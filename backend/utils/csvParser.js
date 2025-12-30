export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const values = line.split(",").map(v => v.trim());
    return headers.reduce((acc, h, i) => {
      acc[h] = values[i] || "";
      return acc;
    }, {});
  });
}
