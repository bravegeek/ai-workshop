import json

file_path = "Firefox 2025-12-16 19.05 profile.json"

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    thread = data['threads'][4]
    names = thread['funcTable']['name']
    
    print(f"Type of names: {type(names)}")
    print(f"First 5 names: {names[:5]}")
    
    # Check if there is a string array in shared or top level if names are indices
    if isinstance(names[0], int):
        print("Names are indices. Checking stringTable...")
        if 'stringTable' in data:
            print("Found global stringTable")
        if 'stringTable' in thread:
            print("Found thread stringTable")

except Exception as e:
    print(f"Error: {e}")
