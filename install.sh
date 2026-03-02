#!/bin/bash

# Simple Installer for Pi-Hive
echo "🐝 Installing Pi-Hive Extension & Skill..."

PI_DIR="$HOME/.pi/agent"
EXT_DIR="$PI_DIR/extensions"
SKILL_DIR="$PI_DIR/skills"

# Create directories if missing
mkdir -p "$EXT_DIR"
mkdir -p "$SKILL_DIR"

# Download the files directly from GitHub main branch
curl -fsSL https://raw.githubusercontent.com/renatocaliari/pi-hive/main/src/index.ts -o "$EXT_DIR/hive.ts"
curl -fsSL https://raw.githubusercontent.com/renatocaliari/pi-hive/main/skills/hive.md -o "$SKILL_DIR/hive.md"

echo "✅ Pi-Hive installed successfully!"
echo "🚀 Try it now: Run 'pi' in any project and type '/hive on'"
