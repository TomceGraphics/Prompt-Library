export async function loadAndMergePatterns() {
  try {
    console.log('[json.js] Loading pattern description and extract files...');

    const [descRes, extractRes] = await Promise.all([
      fetch('./pattern_description.json'),  // Fixed filename to match your actual file
      fetch('./patterns.json')
    ]);

    if (!descRes.ok || !extractRes.ok) {
      throw new Error(`HTTP error: ${descRes.status} / ${extractRes.status}`);
    }

    const [descData, extractData] = await Promise.all([
      descRes.json(),
      extractRes.json()
    ]);

    // Handle both array and object with patterns property
    const descPatterns = Array.isArray(descData) ? descData : 
                        (Array.isArray(descData.patterns) ? descData.patterns : []);
    const extractPatterns = Array.isArray(extractData) ? extractData : 
                          (Array.isArray(extractData.patterns) ? extractData.patterns : []);

    console.log(`Found ${descPatterns.length} description patterns and ${extractPatterns.length} extract patterns`);

    // Merge by patternName
    const mergedMap = new Map();

    // Add descriptions first
    descPatterns.forEach(p => {
      if (p && p.patternName) {
        mergedMap.set(p.patternName, {
          patternName: p.patternName,
          description: p.description || '',
          tags: Array.isArray(p.tags) ? p.tags.map(t => String(t || '').trim()).filter(Boolean) : [],
          pattern_extract: ''
        });
      }
    });

    // Merge pattern_extracts
    extractPatterns.forEach(p => {
      if (p && p.patternName) {
        if (mergedMap.has(p.patternName)) {
          mergedMap.get(p.patternName).pattern_extract = p.pattern_extract || '';
        } else {
          mergedMap.set(p.patternName, {
            patternName: p.patternName,
            description: '',
            tags: [],
            pattern_extract: p.pattern_extract || ''
          });
        }
      }
    });

    const mergedPatterns = Array.from(mergedMap.values());

    // Collect all tags
    const allTags = [...new Set(
      mergedPatterns.flatMap(p => p.tags || [])
    )].sort((a, b) => a.localeCompare(b));

    console.log(`[json.js] Successfully merged ${mergedPatterns.length} patterns with ${allTags.length} unique tags`);
    
    return {
      mergedPatterns,
      allTags
    };

  } catch (error) {
    console.error('[json.js] Failed to load patterns:', error);
    return {
      mergedPatterns: [],
      allTags: [],
      error: error.message
    };
  }
}