// App entry: wires modules together

import { loadPromptsData, getAllTags } from './modules/data.js';
import { state } from './modules/state.js';
import { setupSidebar } from './modules/sidebar.js';
import { setupPromptsArea, loadAndRenderPrompts } from './modules/prompts.js';
import { setupModal } from './modules/modal.js';

async function initApp() {
    // Theme preference
    if (state.theme === 'dark' || (!state.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    await loadPromptsData('prompts.json');

    setupSidebar();
    setupPromptsArea(getAllTags());
    setupModal();

    loadAndRenderPrompts();
}

document.addEventListener('DOMContentLoaded', initApp);


