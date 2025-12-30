#!/bin/bash
# Generate all favicon sizes from Picture1.png

cd "$(dirname "$0")"

# Generate all sizes
sips -z 256 256 Picture1.png --out favicon-256x256.png
sips -z 128 128 Picture1.png --out favicon-128x128.png
sips -z 64 64 Picture1.png --out favicon-64x64.png
sips -z 32 32 Picture1.png --out favicon-32x32.png
sips -z 16 16 Picture1.png --out favicon-16x16.png
sips -z 128 128 Picture1.png --out favicon.ico
sips -z 180 180 Picture1.png --out apple-touch-icon.png

# Create base64 for SVG
base64 -i Picture1.png -o seo_base64.txt

echo "✅ All favicon sizes generated!"

