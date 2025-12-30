import stringPixelWidth from "string-pixel-width";

// Google SERP uses specific font settings:
// Title: Arial, 18px, bold (600 weight)
// Description: Arial, 14px, normal (400 weight)
// Calibrated using exact Google measurements from SERP tool

// Calibration test strings:
// Title: "The One Way Valve Douche Innovative Hygiene Tool." = 475px in Google
// Description: "The One Way Valve Douche is a vaginal cleansing device designed to promote internal hygiene through a one-way valve mechanism Built to last." = 900px in Google

export function titlePx(text) {
  // Google's title font: Arial, 18px, bold
  // CRITICAL: Must match frontend measurement exactly
  // Frontend uses: canvas.measureText() * 1.027
  // Backend uses: stringPixelWidth() * multiplier
  // We need to match the frontend result so optimization works correctly
  // Testing shows frontend canvas measurement is slightly different from stringPixelWidth
  // Using 0.897 was calibrated for Google, but frontend shows different values
  // Need to match frontend's 1.027 adjustment to ensure backend optimization matches frontend display
  const baseWidth = stringPixelWidth(text, { font: "Arial", size: 18, bold: true });
  // Use 0.875 to approximate frontend's canvas measurement * 1.027
  // This ensures backend optimization matches what frontend will display
  return Math.round(baseWidth * 0.875);
}

export function descriptionPx(text) {
  // Google's description font: Arial, 14px, normal
  // Direct measurement using string-pixel-width with exact Google font settings
  // No multiplier - using raw measurement which should match Google's canvas measurement
  return Math.round(stringPixelWidth(text, { font: "Arial", size: 14 }));
}
