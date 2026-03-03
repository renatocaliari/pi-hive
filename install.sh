#!/bin/bash

# Simple Installer for Pi-Hive
echo "🐝 Installing Pi-Hive Extension & Skill..."

PI_DIR="$HOME/.pi/agent"
EXT_DIR="$PI_DIR/extensions"
SKILL_DIR="$PI_DIR/skills/hive"

# Create directories if missing
mkdir -p "$EXT_DIR"
mkdir -p "$SKILL_DIR"

# Timestamp to bypass GitHub cache
TS=$(date +%s)

# Download the files directly from GitHub main branch
curl -fsSL "https://raw.githubusercontent.com/renatocaliari/pi-hive/main/src/index.ts?t=$TS" -o "$EXT_DIR/hive.ts"
curl -fsSL "https://raw.githubusercontent.com/renatocaliari/pi-hive/main/skills/hive/SKILL.md?t=$TS" -o "$SKILL_DIR/SKILL.md"

# Cleanup old skill file if exists
rm -f "$PI_DIR/skills/hive.md"

echo "✅ Pi-Hive installed successfully!"
echo "🚀 Try it now: Run 'pi' in any project and type '/hive on'"
