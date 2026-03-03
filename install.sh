#!/bin/bash

echo "🐝 Installing Pi-Hive..."

# Define Pi directories
PI_AGENT_DIR="$HOME/.pi/agent"
PI_GLOBAL_DIR="$HOME/.pi"

# 1. CLEANUP (Remove any old installations to prevent conflicts)
echo "🧹 Cleaning up old installations..."
rm -f "$PI_AGENT_DIR/skills/hive.md"
rm -f "$PI_GLOBAL_DIR/skills/hive.md"
rm -rf "$PI_AGENT_DIR/skills/hive"
rm -rf "$PI_GLOBAL_DIR/skills/hive"
rm -f "$PI_AGENT_DIR/extensions/hive.ts"
rm -f "$PI_GLOBAL_DIR/extensions/hive.ts"
rm -rf "$PI_AGENT_DIR/git/github.com/renatocaliari/pi-hive"
rm -rf "$PI_GLOBAL_DIR/git/github.com/renatocaliari/pi-hive"
rm -rf "$PI_AGENT_DIR/packages/pi-hive"
rm -rf "$PI_GLOBAL_DIR/packages/pi-hive"

# 2. INSTALL using pi package manager (recommended)
echo "📦 Installing via pi package manager..."
pi install "$PWD"

echo ""
echo "✅ Pi-Hive installed successfully!"
echo "🚀 Open Pi and type '/hive on' to start."
echo ""
echo "📝 Note: The package.json declares resources under the 'pi' key."
echo "   Pi will automatically discover:"
echo "   - Extension: ./hive/hive.ts"
echo "   - Skill: ./hive/SKILL.md"
