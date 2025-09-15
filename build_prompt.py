import os
import json

# Paths
PATTERNS_DIR = "patterns"
OUTPUT_FILE = "prompts.json"

def read_file(path):
    """Read file content if exists, else return empty string."""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

def build_prompts():
    patterns = []

    # Loop through all subfolders in patterns/
    for folder in sorted(os.listdir(PATTERNS_DIR)):
        folder_path = os.path.join(PATTERNS_DIR, folder)
        if not os.path.isdir(folder_path):
            continue

        system = read_file(os.path.join(folder_path, "system.md"))
        description = read_file(os.path.join(folder_path, "description.md"))

        # Tags: split by commas or newlines, strip whitespace
        tags_raw = read_file(os.path.join(folder_path, "tags.md"))
        tags = [t.strip() for t in tags_raw.replace(",", "\n").split("\n") if t.strip()]

        pattern = {
            "id": folder,
            "description": description,
            "tags": tags,
            "system": system
        }
        patterns.append(pattern)

    # Deduplicate by id
    unique_patterns = {p["id"]: p for p in patterns}
    patterns = list(unique_patterns.values())

    # Final JSON
    result = {"patterns": patterns}

    # Save to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ Built {len(patterns)} patterns into {OUTPUT_FILE}")

if __name__ == "__main__":
    build_prompts()
