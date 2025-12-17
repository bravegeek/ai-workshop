import json
from collections import Counter

file_path = "Firefox 2025-12-16 19.05 profile.json"

def analyze_thread(data, thread_index, thread_name):
    print(f"\nAnalyzing Thread {thread_index}: {thread_name}")
    thread = data['threads'][thread_index]
    
    samples = thread['samples']
    stack_table = thread['stackTable']
    frame_table = thread['frameTable']
    func_table = thread['funcTable']
    string_array = data['shared']['stringArray']
    
    if 'stack' not in samples or not samples['stack']:
        print("  No samples found.")
        return

    print(f"  Processing {len(samples['stack'])} samples...")
    
    function_counts = Counter()
    
    def get_func_name(func_index):
        if func_index is None: return "Unknown"
        name_index = func_table['name'][func_index]
        if name_index >= 0 and name_index < len(string_array):
            return string_array[name_index]
        return f"Unknown({name_index})"

    for stack_index in samples['stack']:
        if stack_index is None: continue
        
        # Get the leaf frame of this stack
        frame_index = stack_table['frame'][stack_index]
        
        # Get the function of this frame
        func_index = frame_table['func'][frame_index]
        
        # Determine name
        name = get_func_name(func_index)
        if name != "__libc_poll": # Filter out idle time
            function_counts[name] += 1

    print("  Top 20 Active Functions by Self-Time:")
    print("  " + "-" * 50)
    for name, count in function_counts.most_common(20):
        print(f"  {count:5d} : {name}")

try:
    print("Loading JSON...")
    with open(file_path, 'r') as f:
        data = json.load(f)
    print("JSON loaded.")
    
    # Thread 2: Compositor
    analyze_thread(data, 2, "Compositor")
    
    # Thread 4: GeckoMain (tab)
    analyze_thread(data, 4, "GeckoMain (Tab)")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()