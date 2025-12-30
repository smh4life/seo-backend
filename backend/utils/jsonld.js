export function generateProductJSONLD({ name, description, brand }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: brand || "Unknown"
    }
  };
}
