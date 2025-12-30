export function getTrainingStep(type, step = 0) {
  const steps = {
    single: [
      "Enter a topic you want to optimize.",
      "Click Generate to create SEO metadata.",
      "Review and copy your results."
    ],
    batch: [
      "Paste one topic per line.",
      "Generate all topics at once.",
      "Export results as CSV."
    ]
  };

  return steps[type]?.[step] || null;
}
