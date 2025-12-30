# Favicon Issue - Need High Contrast White Version

The current favicon is too small and dark to see in browser tabs.

**Solution Needed:**
Create a simple white square (256x256) with a large, dark robot icon that takes up most of the space (70-80% of canvas).

**Requirements:**
- White background (#FFFFFF)
- Large dark robot (#1a1a1a or black)
- Bright blue eyes (#60a5fa) for visibility
- Simple shapes (rectangles, circles) - no fine details
- Robot should be clearly recognizable even at 16px

**Manual Steps:**
1. Open favicon_simple.svg in a browser or image editor
2. Export as PNG at 256x256
3. Save as favicon_white_simple.png
4. Run: sips -z 128 128 favicon_white_simple.png --out favicon_io/favicon-128x128.png
5. Generate all sizes (256, 128, 64, 32, 16, ico)

Or use an online SVG to PNG converter.
