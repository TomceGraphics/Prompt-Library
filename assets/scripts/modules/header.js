// Header component that handles both mobile and desktop header
import { state, persist } from './state.js';
import { loadAndRenderPrompts } from './prompts.js';

export function setupHeader() {
    createHeader();
    setupEventListeners();
    updateHeaderForViewport();
    window.addEventListener('resize', updateHeaderForViewport);
}

function createHeader() {
    // Create header container
    const header = document.createElement('header');
    header.className = 'header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700';
    
    // Mobile header (shown on small screens)
    const mobileHeader = `
        <div class="lg:hidden flex items-center justify-between p-4">
            <button id="mobile-menu-button" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle menu">
                <iconify-icon icon="lucide:menu" class="text-xl"></iconify-icon>
            </button>
            <h1 class="text-lg font-semibold text-gray-800 dark:text-white">Prompt Library</h1>
            <div class="w-8"></div> <!-- Spacer for alignment -->
        </div>
    `;
    
    // Desktop header (shown on larger screens)
    const desktopHeader = `
        <div class="hidden lg:flex items-center justify-between p-4">
            <div class="flex-1 max-w-2xl">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <iconify-icon icon="lucide:search" class="text-gray-400"></iconify-icon>
                    </div>
                    <input type="text" id="search-input" 
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                           placeholder="Search prompts...">
                </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
                <button id="view-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                        aria-label="Toggle view">
                    <iconify-icon id="view-icon" icon="lucide:layout-grid" class="text-xl"></iconify-icon>
                </button>
                <button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                        aria-label="Toggle theme">
                    <iconify-icon icon="lucide:sun" class="text-xl dark:hidden"></iconify-icon>
                    <iconify-icon icon="lucide:moon" class="text-xl hidden dark:block"></iconify-icon>
                </button>
            </div>
        </div>
    `;
    
    header.innerHTML = mobileHeader + desktopHeader;
    
    // Insert header at the beginning of the body
    document.body.insertBefore(header, document.body.firstChild);
    
    // Add mobile search (only visible when scrolled on mobile)
    const mobileSearch = document.createElement('div');
    mobileSearch.className = 'lg:hidden px-4 pb-4';
    mobileSearch.innerHTML = `
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <iconify-icon icon="lucide:search" class="text-gray-400"></iconify-icon>
            </div>
            <input type="text" id="mobile-search-input" 
                   class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                   placeholder="Search prompts...">
        </div>
    `;
    header.appendChild(mobileSearch);
}

function setupEventListeners() {
    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', toggleMobileMenu);
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // View toggle
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', toggleView);
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    
    const handleSearch = (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        loadAndRenderPrompts();
    };
    
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (mobileSearchInput) mobileSearchInput.addEventListener('input', handleSearch);
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    persist.theme(isDark ? 'dark' : 'light');
}

function toggleView() {
    const viewIcon = document.getElementById('view-icon');
    const promptsContainer = document.getElementById('prompts-container');
    
    if (state.currentView === 'grid') {
        state.currentView = 'list';
        viewIcon.setAttribute('icon', 'lucide:list');
        promptsContainer.classList.remove('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        promptsContainer.classList.add('grid-cols-1');
    } else {
        state.currentView = 'grid';
        viewIcon.setAttribute('icon', 'lucide:layout-grid');
        promptsContainer.classList.remove('grid-cols-1');
        promptsContainer.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    }
    
    persist.view(state.currentView);
    loadAndRenderPrompts();
}

function updateHeaderForViewport() {
    const header = document.querySelector('.header');
    const mobileSearch = header?.querySelector('.lg\:hidden + div');
    
    if (window.innerWidth >= 1024) { // lg breakpoint
        // Hide mobile menu if open when resizing to desktop
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        sidebar?.classList.remove('-translate-x-full');
        overlay?.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        
        // Show/hide mobile search based on scroll
        if (mobileSearch) {
            mobileSearch.classList.toggle('hidden', window.scrollY < 100);
        }
    }
}

// Handle scroll to show/hide mobile search
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    if (window.innerWidth < 1024) { // Only on mobile
        const header = document.querySelector('.header');
        const mobileSearch = header?.querySelector('.lg\:hidden + div');
        const st = window.pageYOffset || document.documentElement.scrollTop;
        
        if (st > lastScrollTop && st > 50) {
            // Scrolling down, show search
            mobileSearch?.classList.remove('hidden');
        } else if (st < lastScrollTop && st < 50) {
            // Scrolling up near top, hide search
            mobileSearch?.classList.add('hidden');
        }
        
        lastScrollTop = st <= 0 ? 0 : st;
    }
});
