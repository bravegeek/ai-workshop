import json
import sys

file_path = "Firefox 2025-12-16 19.05 profile.json"

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    print("Top level keys:", list(data.keys()))
    
    if 'threads' in data:
        print(f"Number of threads: {len(data['threads'])}")
        for i, thread in enumerate(data['threads']):
            name = thread.get('name', 'Unknown')
            process_type = thread.get('processType', 'Unknown')
            sample_count = len(thread.get('samples', {}).get('stack', [])) if 'samples' in thread else 0
            if sample_count > 0: # Only show threads with samples
                print(f"Thread {i}: {name} (Process Type: {process_type}) - Samples: {sample_count}")
    
    if 'libs' in data:
         print(f"Number of libs: {len(data['libs'])}")

except Exception as e:
    print(f"Error: {e}")
