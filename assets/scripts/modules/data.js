import { state } from './state.js';

export async function loadPromptsData(relativePath) {
    try {
        // index.html is at project root; scripts are in assets/scripts
        // Fetch relative to index.html location
        const response = await fetch(relativePath);
        if (!response.ok) throw new Error('Failed to load prompts data');
        const data = await response.json();
        state.promptData = data;
        return data;
    } catch (error) {
        console.error('Error loading prompts:', error);
        state.promptData = { patterns: [] };
        return state.promptData;
    }
}

export function getAllTags() {
    const tagsSet = new Set();
    (state.promptData.patterns || []).forEach((p) => {
        (p.tags || []).forEach((t) => tagsSet.add(t));
    });
    state.allTags = Array.from(tagsSet).sort();
    return state.allTags;
}


