import os
import json

# Paths
DESCRIPTION_JSON = "pattern_description.json"
PATTERNS_DIR = "patterns"

def ensure_dir(path):
    """Make sure a directory exists."""
    if not os.path.exists(path):
        os.makedirs(path)

def migrate_descriptions():
    # Load descriptions JSON
    with open(DESCRIPTION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    patterns = data.get("patterns", [])
    print(f"Found {len(patterns)} patterns in {DESCRIPTION_JSON}")

    # Process each pattern
    for pattern in patterns:
        name = pattern.get("patternName")
        description = pattern.get("description", "")
        tags = pattern.get("tags", [])

        if not name:
            print("⚠️ Skipping entry without patternName")
            continue

        # Create folder
        folder = os.path.join(PATTERNS_DIR, name)
        ensure_dir(folder)

        # Write description.md
        desc_path = os.path.join(folder, "description.md")
        with open(desc_path, "w", encoding="utf-8") as f:
            f.write(description.strip() + "\n")

        # Write tags.md (one tag per line)
        tags_path = os.path.join(folder, "tags.md")
        with open(tags_path, "w", encoding="utf-8") as f:
            for tag in tags:
                f.write(tag.strip() + "\n")

        # Create empty system.md if it doesn’t exist
        system_path = os.path.join(folder, "system.md")
        if not os.path.exists(system_path):
            with open(system_path, "w", encoding="utf-8") as f:
                f.write("<!-- Add system prompt here -->\n")

        print(f"✅ Created folder {name} with description.md, tags.md, system.md")

if __name__ == "__main__":
    migrate_descriptions()
