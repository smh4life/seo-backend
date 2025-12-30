#!/bin/bash
# Create white background version of robot favicon
# This uses sips to composite images

# Create white background
sips -s format png -c 512 512 --setProperty formatOptions low -g pixelWidth favicon_robot_large.png 2>&1 | head -1

# For now, we'll use the robot on a transparent background
# The browser will show it, but it might still be dark
# The real solution is to brighten/invert the robot colors

echo "Note: To make the robot truly visible, you may need to:"
echo "1. Open favicon_robot_large.png in an image editor"
echo "2. Add a white circle/square background"
echo "3. Or brighten/invert the robot colors"
