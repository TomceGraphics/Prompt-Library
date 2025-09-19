import { state, persist } from './state.js';

function qs(id) { return document.getElementById(id); }

function getDomRefs() {
    return {
        filterToggle: qs('filter-toggle'),
        filterDropdown: qs('filter-dropdown'),
        tagSearch: qs('tag-search'),
        tagsContainer: qs('tags-container'),
        searchInput: qs('search-input'),
        cardViewBtn: qs('card-view'),
        gridViewBtn: qs('grid-view'),
        promptsContainer: qs('prompts-container'),
        copyNotification: qs('copy-notification'),
    };
}

export function setupPromptsArea(allTags) {
    state.allTags = allTags;
    renderTags();
    setupEventListeners();
}

export function loadAndRenderPrompts() {
    const refs = getDomRefs();
    const searchTerm = (refs.searchInput?.value || '').toLowerCase();

    let filtered = (state.promptData.patterns || []).filter((p) => {
        const matchesSearch = p.id?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(searchTerm));
        const matchesTags = state.selectedTags.length === 0 ||
            state.selectedTags.every((t) => (p.tags || []).includes(t));
        return matchesSearch && matchesTags;
    });

    if (state.currentTab === 'favorites') {
        filtered = filtered.filter((p) => state.favorites.includes(p.id));
    }

    renderPrompts(filtered);
}

function renderTags() {
    const { tagsContainer } = getDomRefs();
    if (!tagsContainer) return;
    tagsContainer.innerHTML = '';
    state.allTags.forEach((tag) => {
        const isSelected = state.selectedTags.includes(tag);
        const tagElement = document.createElement('div');
        tagElement.className = `px-3 py-1 rounded-full text-sm flex items-center cursor-pointer ${isSelected ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800'}`;
        tagElement.innerHTML = `
            <span>${tag}</span>
            ${isSelected ? '<iconify-icon icon="tabler:check" class="ml-1"></iconify-icon>' : ''}
        `;
        tagElement.addEventListener('click', () => toggleTag(tag));
        tagsContainer.appendChild(tagElement);
    });
}

function toggleTag(tag) {
    if (state.selectedTags.includes(tag)) {
        state.selectedTags = state.selectedTags.filter((t) => t !== tag);
    } else {
        state.selectedTags.push(tag);
    }
    renderTags();
    loadAndRenderPrompts();
}

function renderPrompts(prompts) {
    const { promptsContainer } = getDomRefs();
    if (!promptsContainer) return;
    promptsContainer.innerHTML = '';

    if (!prompts?.length) {
        promptsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <iconify-icon icon="tabler:inbox-off" class="text-4xl text-gray-400 mb-4"></iconify-icon>
                <p class="text-gray-500 dark:text-gray-400">No prompts found. Try adjusting your filters.</p>
            </div>
        `;
        return;
    }

    promptsContainer.className = `grid gap-6 ${state.currentView === 'grid' ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1' : 'grid-cols-2'}`;

    prompts.forEach((prompt) => {
        const isFavorite = state.favorites.includes(prompt.id);
        const card = document.createElement('div');
        card.className = `prompt-card bg-white dark:bg-gray-900/20 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${state.currentView === 'grid' ? 'h-40' : ''}`;
        card.innerHTML = `
            <div class="p-5 flex-1">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-lg">${prompt.id}</h3>
                    <div class="flex space-x-2">
                        <button
                            class="favorite-btn flex justify-center items-center text-xl p-2 h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 ${isFavorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 dark:hover:text-red-400 hover:text-red-400'}"
                            title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
                            <iconify-icon icon="${isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}" class="w-5 h-5 inline-block"></iconify-icon>
                        </button>
                        <button
                            class="copy-prompt-btn flex justify-center items-center text-xl text-gray-400 p-2 h-8 w-8 rounded-lg hover:text-blue-500 dark:hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                            title="Copy Prompt">
                            <iconify-icon icon="tabler:copy" class="w-5 h-5 inline-block"></iconify-icon>
                        </button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${(prompt.tags || []).map((tag) => `
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-xs">${tag}</span>
                    `).join('')}
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 ${state.currentView === 'grid' ? 'truncate' : ''}">${prompt.description || ''}</p>
            </div>
            <div class="px-5 pb-5">
                <button class="view-prompt-btn w-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg py-2 text-sm font-medium">
                    Show Prompt
                </button>
            </div>
        `;
        promptsContainer.appendChild(card);

        card.querySelector('.favorite-btn')?.addEventListener('click', () => toggleFavorite(prompt.id));
        card.querySelector('.view-prompt-btn')?.addEventListener('click', () => showPromptDetail(prompt.id));
        card.querySelector('.copy-prompt-btn')?.addEventListener('click', () => copyToClipboard(prompt.system));
    });
}

function toggleFavorite(promptId) {
    if (state.favorites.includes(promptId)) {
        state.favorites = state.favorites.filter((id) => id !== promptId);
    } else {
        state.favorites.push(promptId);
    }
    persist.favorites(state.favorites);
    loadAndRenderPrompts();

    if (state.currentPromptId === promptId) {
        const btn = document.getElementById('modal-favorite');
        const isFav = state.favorites.includes(promptId);
        if (btn) {
            btn.innerHTML = `
                <iconify-icon icon="${isFav ? 'tabler:heart-filled' : 'tabler:heart'}" class="text-xl ${isFav ? 'text-red-500' : ''}"></iconify-icon>
                <span>${isFav ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            `;
        }
    }
}

function showPromptDetail(promptId) {
    const prompt = (state.promptData.patterns || []).find((p) => p.id === promptId);
    if (!prompt) return;
    state.currentPromptId = promptId;
    const event = new CustomEvent('open-prompt-modal', { detail: { prompt } });
    window.dispatchEvent(event);
}

function copyToClipboard(text) {
    const { copyNotification } = getDomRefs();
    navigator.clipboard.writeText(text || '').then(() => {
        copyNotification?.classList.add('show');
        setTimeout(() => copyNotification?.classList.remove('show'), 2000);
    }).catch((err) => console.error('Failed to copy:', err));
}

function setupEventListeners() {
    const refs = getDomRefs();

    refs.filterToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasHidden = refs.filterDropdown?.classList.toggle('hidden');
        if (!wasHidden) setTimeout(() => refs.tagSearch?.focus(), 10);
    });

    document.addEventListener('click', (e) => {
        if (refs.filterDropdown && refs.filterToggle && !refs.filterToggle.contains(e.target) && !refs.filterDropdown.contains(e.target)) {
            refs.filterDropdown.classList.add('hidden');
        }
    });

    refs.tagSearch?.addEventListener('input', () => {
        const searchTerm = (refs.tagSearch?.value || '').toLowerCase();
        const tagElements = refs.tagsContainer?.querySelectorAll('div') || [];
        tagElements.forEach((el) => {
            const text = el.querySelector('span')?.textContent?.toLowerCase() || '';
            el.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    refs.searchInput?.addEventListener('input', loadAndRenderPrompts);

    refs.cardViewBtn?.addEventListener('click', () => {
        if (state.currentView !== 'card') {
            state.currentView = 'card';
            refs.cardViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            refs.gridViewBtn?.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            loadAndRenderPrompts();
        }
    });

    refs.gridViewBtn?.addEventListener('click', () => {
        if (state.currentView !== 'grid') {
            state.currentView = 'grid';
            refs.gridViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            refs.cardViewBtn?.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            loadAndRenderPrompts();
        }
    });

    // Modal bridge events
    window.addEventListener('toggle-favorite-from-modal', (e) => {
        const promptId = e.detail?.promptId;
        if (promptId) toggleFavorite(promptId);
    });
    window.addEventListener('copy-from-modal', (e) => {
        const text = e.detail?.text || '';
        copyToClipboard(text);
    });
}


