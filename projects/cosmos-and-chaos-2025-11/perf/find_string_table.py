import json

file_path = "Firefox 2025-12-16 19.05 profile.json"

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    if 'stringTable' in data:
        print(f"Found global stringTable, length: {len(data['stringTable'])}")
        print(f"Sample string 26: {data['stringTable'][26]}")
    elif 'shared' in data and 'stringTable' in data['shared']:
        print(f"Found shared stringTable, length: {len(data['shared']['stringTable'])}")
        # Assuming the index 26 from the previous step is valid here
        st = data['shared']['stringTable']
        if len(st) > 26:
             print(f"Sample string 26: {st[26]}")
    else:
        print("Could not find stringTable")

except Exception as e:
    print(f"Error: {e}")
