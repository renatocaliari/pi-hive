#!/bin/bash

echo "🐝 Installing Pi-Hive (Deep Clean Edition)..."

# Define possible Pi directories
PI_AGENT_DIR="$HOME/.pi/agent"
PI_GLOBAL_DIR="$HOME/.pi"

# 1. CLEANUP (Remove any old loose files)
rm -f "$PI_AGENT_DIR/skills/hive.md"
rm -f "$PI_GLOBAL_DIR/skills/hive.md"
rm -rf "$PI_AGENT_DIR/skills/hive"
rm -rf "$PI_GLOBAL_DIR/skills/hive"

# 2. CREATE NEW STRUCTURE
mkdir -p "$PI_AGENT_DIR/extensions"
mkdir -p "$PI_AGENT_DIR/skills/hive"
mkdir -p "$PI_GLOBAL_DIR/skills/hive"

# Timestamp for cache busting
TS=$(date +%s)

# 3. DOWNLOAD
echo "Downloading files..."
curl -fsSL "https://raw.githubusercontent.com/renatocaliari/pi-hive/main/src/index.ts?t=$TS" -o "$PI_AGENT_DIR/extensions/hive.ts"
curl -fsSL "https://raw.githubusercontent.com/renatocaliari/pi-hive/main/skills/hive/SKILL.md?t=$TS" -o "$PI_AGENT_DIR/skills/hive/SKILL.md"

# Mirror to global skills dir for guaranteed discovery
cp "$PI_AGENT_DIR/skills/hive/SKILL.md" "$PI_GLOBAL_DIR/skills/hive/SKILL.md"

echo "✅ Pi-Hive installed successfully!"
echo "🚀 Open Pi and type '/hive on' to start."
