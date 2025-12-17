import json

file_path = "Firefox 2025-12-16 19.05 profile.json"

def analyze_jank(data, thread_index, thread_name):
    print(f"\nAnalyzing Thread {thread_index}: {thread_name} for Long Tasks")
    thread = data['threads'][thread_index]
    
    samples = thread['samples']
    stack_table = thread['stackTable']
    frame_table = thread['frameTable']
    func_table = thread['funcTable']
    string_array = data['shared']['stringArray']
    
    if 'stack' not in samples or not samples['stack']:
        print("  No samples found.")
        return

    # Helper to resolve function names
    def get_func_name(func_index):
        if func_index is None: return "Unknown"
        name_index = func_table['name'][func_index]
        if name_index >= 0 and name_index < len(string_array):
            return string_array[name_index]
        return f"Unknown({name_index})"

    # Helper to check if a stack is "idle"
    def is_idle(stack_index):
        if stack_index is None: return True
        frame_index = stack_table['frame'][stack_index]
        func_index = frame_table['func'][frame_index]
        name = get_func_name(func_index)
        return name in ["__libc_poll", "__futex_abstimed_wait_common64", "futex_wait", "epoll_wait"]

    # Iterate through samples to find contiguous blocks of NON-IDLE activity
    long_tasks = []
    current_task_start = None
    current_task_samples = []

    # Time per sample is usually fixed (e.g. 1ms), but let's assume raw count for now as a proxy for duration
    # In a real profile, we'd use 'time' or 'weight' arrays if available/reliable.
    
    for i, stack_index in enumerate(samples['stack']):
        if is_idle(stack_index):
            if current_task_start is not None:
                # End of a task
                long_tasks.append({
                    'start_index': current_task_start,
                    'length': len(current_task_samples),
                    'samples': current_task_samples
                })
                current_task_start = None
                current_task_samples = []
        else:
            if current_task_start is None:
                current_task_start = i
            current_task_samples.append(stack_index)
    
    # Capture the last task if active
    if current_task_start is not None:
        long_tasks.append({
            'start_index': current_task_start,
            'length': len(current_task_samples),
            'samples': current_task_samples
        })

    # Sort tasks by length (duration)
    long_tasks.sort(key=lambda x: x['length'], reverse=True)

    print(f"  Found {len(long_tasks)} active tasks.")
    
    print("\n  Top 10 Longest Active Tasks (Potential Jank):")
    for i, task in enumerate(long_tasks[:10]):
        duration_ms = task['length'] # Assuming roughly 1ms per sample for simplicity
        print(f"  Task {i+1}: ~{duration_ms} samples (approx {duration_ms}ms)")
        
        # Analyze the most frequent function in this specific task to guess the culprit
        from collections import Counter
        task_funcs = Counter()
        for stack_index in task['samples']:
             # Walk up the stack a bit? Or just leaf? Let's check leaf.
             frame_index = stack_table['frame'][stack_index]
             func_index = frame_table['func'][frame_index]
             name = get_func_name(func_index)
             task_funcs[name] += 1
        
        top_funcs = task_funcs.most_common(3)
        print(f"    Top Functions: {', '.join([f'{name} ({count})' for name, count in top_funcs])}")

try:
    print("Loading JSON...")
    with open(file_path, 'r') as f:
        data = json.load(f)
    print("JSON loaded.")
    
    # Analyze GeckoMain (Thread 4)
    analyze_jank(data, 4, "GeckoMain (Tab)")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
