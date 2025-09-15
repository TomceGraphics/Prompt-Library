// Sample data (replace with your actual prompt.json)

// Load prompts data
let promptData = { patterns: [] };

// Function to load prompts from JSON file
async function loadPromptsData() {
    try {
        const response = await fetch('../prompts.json');
        if (!response.ok) {
            throw new Error('Failed to load prompts data');
        }
        const data = await response.json();
        promptData = data;
        return data;
    } catch (error) {
        console.error('Error loading prompts:', error);
        return { patterns: [] };
    }
}

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const filterToggle = document.getElementById('filter-toggle');
const filterDropdown = document.getElementById('filter-dropdown');
const tagSearch = document.getElementById('tag-search');
const tagsContainer = document.getElementById('tags-container');
const searchInput = document.getElementById('search-input');
const cardViewBtn = document.getElementById('card-view');
const gridViewBtn = document.getElementById('grid-view');
const promptsContainer = document.getElementById('prompts-container');
const promptModal = document.getElementById('prompt-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalTags = document.getElementById('modal-tags');
const modalDescription = document.getElementById('modal-description');
const modalPrompt = document.getElementById('modal-prompt');
const modalFavorite = document.getElementById('modal-favorite');
const modalCopy = document.getElementById('modal-copy');
const copyNotification = document.getElementById('copy-notification');
const tabLinks = document.querySelectorAll('.tab-link');

// State
let currentView = 'card';
let currentPromptId = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedTags = [];
let allTags = [];
let currentTab = 'explore';
let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
}

// Initialize the app after loading data
async function init() {
    // Initialize sidebar state
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggle.innerHTML = '<iconify-icon icon="lucide:panel-left-open" class="text-xl"></iconify-icon>';
    } else {
        sidebarToggle.innerHTML = '<iconify-icon icon="lucide:panel-left-close" class="text-xl"></iconify-icon>';
    }
    
    await loadPromptsData();
    extractAllTags();
    renderTags();
    setupEventListeners();
    loadPrompts();
}

// Extract all unique tags from prompts
function extractAllTags() {
    const tagsSet = new Set();
    promptData.patterns.forEach(prompt => {
        prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    allTags = Array.from(tagsSet).sort();
}

// Render tags in the filter dropdown
function renderTags() {
    tagsContainer.innerHTML = '';
    allTags.forEach(tag => {
        const isSelected = selectedTags.includes(tag);
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

// Toggle tag selection
function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
    } else {
        selectedTags.push(tag);
    }
    renderTags();
    loadPrompts();
}

// Load and display prompts based on filters
function loadPrompts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredPrompts = promptData.patterns.filter(prompt => {
        // Filter by search term
        const matchesSearch = prompt.id.toLowerCase().includes(searchTerm) || 
                            prompt.description.toLowerCase().includes(searchTerm) ||
                            prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        // Filter by selected tags
        const matchesTags = selectedTags.length === 0 || 
                          selectedTags.every(tag => prompt.tags.includes(tag));
        
        return matchesSearch && matchesTags;
    });

    // Apply tab filter
    if (currentTab === 'favorites') {
        filteredPrompts = filteredPrompts.filter(prompt => favorites.includes(prompt.id));
    }

    renderPrompts(filteredPrompts);
}

// Render prompts in the current view
function renderPrompts(prompts) {
    promptsContainer.innerHTML = '';
    
    if (prompts.length === 0) {
        promptsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <iconify-icon icon="tabler:inbox-off" class="text-4xl text-gray-400 mb-4"></iconify-icon>
                <p class="text-gray-500 dark:text-gray-400">No prompts found. Try adjusting your filters.</p>
            </div>
        `;
        return;
    }
    
    // Update grid classes based on current view
    promptsContainer.className = `grid gap-6 ${currentView === 'grid' ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1' : 'grid-cols-2'}`;
    
    prompts.forEach(prompt => {
        const isFavorite = favorites.includes(prompt.id)
        
        const promptElement = document.createElement('div');
        promptElement.className = `prompt-card bg-white dark:bg-gray-900/20 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${currentView === 'grid' ? 'h-40' : ''}`;
        
        promptElement.innerHTML = `
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
                    ${prompt.tags.map(tag => `
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-xs">${tag}</span>
                    `).join('')}
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 ${currentView === 'grid' ? 'truncate' : ''}">${prompt.description}</p>
            </div>
            <div class="px-5 pb-5">
                <button class="view-prompt-btn w-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg py-2 text-sm font-medium">
                    Show Prompt
                </button>
            </div>
        `;
        
        promptsContainer.appendChild(promptElement);
        
        // Add event listeners to the buttons
        promptElement.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(prompt.id));
        promptElement.querySelector('.view-prompt-btn').addEventListener('click', () => showPromptDetail(prompt.id));
        promptElement.querySelector('.copy-prompt-btn').addEventListener('click', () => copyToClipboard(prompt.system));
    });
}

// Toggle favorite status
function toggleFavorite(promptId) {
    if (favorites.includes(promptId)) {
        favorites = favorites.filter(id => id !== promptId);
    } else {
        favorites.push(promptId);
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Reload prompts to update UI
    loadPrompts();
    
    // If modal is open for this prompt, update the favorite button
    if (currentPromptId === promptId) {
        const isFavorite = favorites.includes(promptId);
        modalFavorite.innerHTML = `
            <iconify-icon icon="${isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}" class="text-xl ${isFavorite ? 'text-red-500' : ''}"></iconify-icon>
            <span>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        `;
    }
}

// Show prompt detail in modal
function showPromptDetail(promptId) {
    const prompt = promptData.patterns.find(p => p.id === promptId);
    if (!prompt) return;
    
    currentPromptId = promptId;
    const isFavorite = favorites.includes(promptId);
    
    modalTitle.textContent = prompt.id;
    modalDescription.textContent = prompt.description;
    modalPrompt.textContent = prompt.system;
    
    // Render tags
    modalTags.innerHTML = '';
    prompt.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'px-2 py-1 bg-gray-100 dark:bg-gray-800/50  rounded-full text-xs';
        tagElement.textContent = tag;
        modalTags.appendChild(tagElement);
    });
    
    // Update favorite button
    modalFavorite.innerHTML = `
        <iconify-icon icon="${isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}" class="text-xl ${isFavorite ? 'text-red-500' : ''}"></iconify-icon>
        <span>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
    `;
    
    // Show modal
    promptModal.classList.remove('hidden');
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show notification
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Toggle sidebar collapse
function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggle.innerHTML = '<iconify-icon icon="lucide:panel-left-open" class="text-xl"></iconify-icon>';
    } else {
        sidebar.classList.remove('collapsed');
        sidebarToggle.innerHTML = '<iconify-icon icon="lucide:panel-left-close" class="text-xl"></iconify-icon>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Filter dropdown toggle
    filterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasHidden = filterDropdown.classList.toggle('hidden');
        if (!wasHidden) {
            // Focus the tag search input after a small delay to ensure the dropdown is visible
            setTimeout(() => tagSearch.focus(), 10);
        }
    });
    
    // Close filter dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterToggle.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add('hidden');
        }
    });
    
    // Tag search
    tagSearch.addEventListener('input', () => {
        const searchTerm = tagSearch.value.toLowerCase();
        const tagElements = tagsContainer.querySelectorAll('div');
        
        tagElements.forEach(tagElement => {
            const tagText = tagElement.querySelector('span').textContent.toLowerCase();
            if (tagText.includes(searchTerm)) {
                tagElement.style.display = 'flex';
            } else {
                tagElement.style.display = 'none';
            }
        });
    });
    
    // Search input
    searchInput.addEventListener('input', loadPrompts);
    
    // View toggle
    cardViewBtn.addEventListener('click', () => {
        if (currentView !== 'card') {
            currentView = 'card';
            cardViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            gridViewBtn.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            loadPrompts();
        }
    });
    
    gridViewBtn.addEventListener('click', () => {
        if (currentView !== 'grid') {
            currentView = 'grid';
            gridViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            cardViewBtn.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
            loadPrompts();
        }
    });
    
    // Modal events
    closeModal.addEventListener('click', () => {
        promptModal.classList.add('hidden');
    });
    
    modalFavorite.addEventListener('click', () => {
        if (currentPromptId) {
            toggleFavorite(currentPromptId);
        }
    });
    
    modalCopy.addEventListener('click', () => {
        if (currentPromptId) {
            const prompt = promptData.patterns.find(p => p.id === currentPromptId);
            if (prompt) {
                copyToClipboard(prompt.system);
            }
        }
    });
    
    // Close modal when clicking outside
    promptModal.addEventListener('click', (e) => {
        if (e.target === promptModal) {
            promptModal.classList.add('hidden');
        }
    });
    
    // Tab navigation
    tabLinks.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            tabLinks.forEach(t => t.classList.remove('text-blue-600', 'dark:text-blue-400', 'bg-blue-400/50', 'dark:bg-blue-950/50'));
            tab.classList.add('text-blue-600', 'dark:text-blue-400', 'bg-blue-400/50', 'dark:bg-blue-950/50');
            
            // Update current tab and reload prompts
            currentTab = tabName;
            loadPrompts();
        });
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);