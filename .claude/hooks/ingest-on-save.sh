#!/bin/bash
# Auto-ingest files into RAG index after Edit or Write tool use.
# Reads tool input from stdin as JSON, extracts file_path, ingests if it's a .md file.

input=$(cat)
file_path=$(echo "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except:
    print('')
" 2>/dev/null)

if [ -n "$file_path" ] && [ -f "$file_path" ]; then
    case "$file_path" in
        *.md|*.txt)
            npx mcp-local-rag ingest "$file_path" 2>/dev/null &
            ;;
    esac
fi
