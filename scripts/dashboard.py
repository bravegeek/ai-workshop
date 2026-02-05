#!/usr/bin/env python3
import os
import glob
import re
from datetime import datetime

# ANSI colors for terminal output
BOLD = "\033[1m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RESET = "\033[0m"

def get_session_info(file_path):
    try:
        mtime = os.path.getmtime(file_path)
        dt_mtime = datetime.fromtimestamp(mtime)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Try to find Next Steps section
        # Supports: ## Next Steps, ### Next Steps, etc.
        next_steps_match = re.search(r'##+ Next Steps\n(.*?)(?=\n##|$)', content, re.DOTALL | re.IGNORECASE)
        
        next_step = "No specific next steps found."
        if next_steps_match:
            steps_text = next_steps_match.group(1).strip()
            # Find the first bullet point
            bullet_match = re.search(r'^\s*[\*\-\d\.]+\s*(.*)', steps_text, re.MULTILINE)
            if bullet_match:
                next_step = bullet_match.group(1).strip()
            elif steps_text:
                next_step = steps_text.split('\n')[0].strip()

        return {
            'path': file_path,
            'mtime': dt_mtime,
            'next_step': next_step
        }
    except Exception:
        return None

def main():
    # Get the root directory (parent of scripts/)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    patterns = [
        os.path.join(root_dir, 'projects', '*', 'session.md'),
        os.path.join(root_dir, 'sessions', '*', 'session.md'),
    ]
    
    files = []
    for pattern in patterns:
        files.extend(glob.glob(pattern))
    
    # Filter out the script itself or non-markdown files if any
    files = [f for f in set(files) if f.endswith('.md')]
    
    results = []
    for f in files:
        info = get_session_info(f)
        if info:
            results.append(info)
            
    # Sort by mtime descending (most recent first)
    results.sort(key=lambda x: x['mtime'], reverse=True)
    
    print(f"\n{BOLD}{CYAN}PROJECT DASHBOARD (Last Modified First){RESET}")
    print(f"{BOLD}{'-' * 100}{RESET}")
    print(f"{BOLD}{'FOLDER':<45} | {'LAST MODIFIED':<18} | {'NEXT STEP'}{RESET}")
    print(f"{'-' * 100}")
    
    for res in results:
        rel_path = os.path.relpath(res['path'], root_dir)
        display_name = os.path.dirname(rel_path)
        mtime_str = res['mtime'].strftime('%Y-%m-%d %H:%M')
        
        # Color code the date if it's very recent (today)
        date_color = GREEN if res['mtime'].date() == datetime.now().date() else RESET
        
        print(f"{display_name:<45} | {date_color}{mtime_str:<18}{RESET} | {res['next_step']}")
    print(f"{BOLD}{'-' * 100}{RESET}\n")

if __name__ == "__main__":
    main()
