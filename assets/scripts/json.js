// json.js

// Load main prompts.json and merge with user-added prompts
export async function loadAndMergePatterns() {
  try {
    // Load base prompts
    const res = await fetch('prompts.json');
    const data = await res.json();
    const basePatterns = Array.isArray(data.patterns) ? data.patterns : [];

    // Load user-added prompts from localStorage
    const userPatterns = JSON.parse(localStorage.getItem('userPrompts') || '[]');

    // Merge, deduplicate by ID (user prompts can override base if same ID)
    const mergedMap = {};
    basePatterns.forEach(p => {
      mergedMap[p.id] = { ...p, isFavorite: false };
    });
    userPatterns.forEach(p => {
      mergedMap[p.id] = { ...p, isFavorite: false };
    });

    const mergedPatterns = Object.values(mergedMap);

    // Extract all unique tags
    const allTagsSet = new Set();
    mergedPatterns.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => allTagsSet.add(tag));
      }
    });

    return {
      mergedPatterns,
      allTags: Array.from(allTagsSet).sort()
    };
  } catch (err) {
    console.error('Failed to load prompts.json', err);
    return { mergedPatterns: [], allTags: [] };
  }
}
