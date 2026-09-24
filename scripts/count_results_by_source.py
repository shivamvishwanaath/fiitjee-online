import json
import os
from collections import Counter

results_file = "d:/Project-files/web-dev/fiitjee/results.json"
if os.path.exists(results_file):
    with open(results_file, "r", encoding="utf-8") as f:
        students = json.load(f)
    print(f"Total students in results.json: {len(students)}")
    
    print("\nCounts by Category:")
    cat_counts = Counter(s.get("category") for s in students)
    for cat, count in cat_counts.most_common():
        print(f"  - {cat}: {count}")
        
    print("\nCounts by Source Domain/Page:")
    src_counts = Counter(s.get("source") for s in students)
    for src, count in src_counts.most_common():
        print(f"  - {src}: {count}")
else:
    print("results.json does not exist.")
