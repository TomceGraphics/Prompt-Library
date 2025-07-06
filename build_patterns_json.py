import os
import json

def build_patterns_json(patterns_dir='patterns', output_file='patterns.json'):
    patterns = []

    # List all directories inside patterns_dir
    for entry in os.listdir(patterns_dir):
        folder_path = os.path.join(patterns_dir, entry)
        if os.path.isdir(folder_path):
            system_md_path = os.path.join(folder_path, 'system.md')
            if os.path.isfile(system_md_path):
                with open(system_md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                patterns.append({
                    "patternName": entry,
                    "pattern_extract": content
                })
            else:
                print(f"Warning: 'system.md' not found in folder '{entry}'")
    
    # Write consolidated JSON
    with open(output_file, 'w', encoding='utf-8') as out_f:
        json.dump({"patterns": patterns}, out_f, ensure_ascii=False, indent=2)
    print(f"Generated {output_file} with {len(patterns)} patterns.")

if __name__ == "__main__":
    build_patterns_json()
