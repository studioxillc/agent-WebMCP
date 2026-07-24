#!/usr/bin/env bash
set -e

echo "🔍 Running Graphify Codebase Analyzer..."

if command -v graphify &> /dev/null; then
    graphify .
elif command -v uvx &> /dev/null; then
    uvx graphify .
else
    echo "⚠️ Graphify CLI not found in PATH or uvx."
    echo "💡 Install graphify via Python uv tool: 'uv tool install graphifyy' or pip: 'pip install graphifyy'"
    echo "ℹ️ Graphify helps AI agents analyze codebase AST relationships via tree-sitter."
    exit 0
fi

echo "✅ Graphify analysis complete. Graph outputs saved to graphify-out/"
