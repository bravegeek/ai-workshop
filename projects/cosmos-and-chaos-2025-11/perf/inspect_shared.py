import json

file_path = "Firefox 2025-12-16 19.05 profile.json"

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    if 'shared' in data:
        print("Shared keys:", list(data['shared'].keys()))

except Exception as e:
    print(f"Error: {e}")
