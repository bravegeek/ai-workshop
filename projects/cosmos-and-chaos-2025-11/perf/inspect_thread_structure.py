import json

file_path = "Firefox 2025-12-16 19.05 profile.json"

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    thread = data['threads'][4] # GeckoMain (tab)
    print("Thread keys:", list(thread.keys()))
    
    if 'samples' in thread:
        print("Samples keys:", list(thread['samples'].keys()))
    
    if 'stackTable' in thread:
        print("StackTable keys:", list(thread['stackTable'].keys()))
        
    if 'funcTable' in thread:
        print("FuncTable keys:", list(thread['funcTable'].keys()))
        
    if 'frameTable' in thread:
         print("FrameTable keys:", list(thread['frameTable'].keys()))

except Exception as e:
    print(f"Error: {e}")
