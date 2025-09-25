class Header {
    constructor() {
        this.searchInput = null;
        this.filterToggle = null;
        this.filterDropdown = null;
        this.tagSearch = null;
        this.cardViewBtn = null;
        this.gridViewBtn = null;
        this.init();
    }

    init() {
        this.createHeader();
        this.setupEventListeners();
    }

    createHeader() {
        const header = document.createElement('header');
        header.className = 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 min-h-20';
        header.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="relative w-1/3">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <iconify-icon icon="tabler:search" class="text-gray-400"></iconify-icon>
                    </div>
                    <input type="text" id="search-input" class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" placeholder="Search prompts...">
                </div>
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <button id="filter-toggle" class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-4 py-2.5">
                            <iconify-icon icon="tabler:filter"></iconify-icon>
                            <span>Filter</span>
                        </button>
                        <div id="filter-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-4">
                            <input type="text" id="tag-search" class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg block w-full p-2.5 mb-3" placeholder="Search tags...">
                            <div class="max-h-60 overflow-y-auto custom-scrollbar">
                                <div class="flex flex-wrap gap-2" id="tags-container">
                                    <!-- Tags will be populated by JavaScript -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-1 p-1 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <button id="card-view" class="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/50 text-blue-500">
                            <iconify-icon class="h-[16px] w-[16px]" icon="tabler:layout-grid"></iconify-icon>
                        </button>
                        <button id="grid-view" class="w-8 h-8 flex items-center justify-center rounded-md">
                            <iconify-icon icon="tabler:layout-list"></iconify-icon>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Store references to elements
        this.searchInput = header.querySelector('#search-input');
        this.filterToggle = header.querySelector('#filter-toggle');
        this.filterDropdown = header.querySelector('#filter-dropdown');
        this.tagSearch = header.querySelector('#tag-search');
        this.cardViewBtn = header.querySelector('#card-view');
        this.gridViewBtn = header.querySelector('#grid-view');

        return header;
    }

    setupEventListeners() {
        // Toggle filter dropdown
        if (this.filterToggle && this.filterDropdown) {
            this.filterToggle.addEventListener('click', () => {
                this.filterDropdown.classList.toggle('hidden');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.filterDropdown && !this.filterDropdown.contains(e.target) && 
                this.filterToggle && !this.filterToggle.contains(e.target)) {
                this.filterDropdown.classList.add('hidden');
            }
        });

        // Toggle view buttons
        if (this.cardViewBtn && this.gridViewBtn) {
            this.cardViewBtn.addEventListener('click', () => {
                this.cardViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
                this.gridViewBtn.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
                document.dispatchEvent(new CustomEvent('viewChanged', { detail: 'card' }));
            });

            this.gridViewBtn.addEventListener('click', () => {
                this.gridViewBtn.classList.add('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
                this.cardViewBtn.classList.remove('bg-blue-100', 'dark:bg-blue-950/50', 'text-blue-500');
                document.dispatchEvent(new CustomEvent('viewChanged', { detail: 'grid' }));
            });
        }
    }

    // Public method to get the header element
    getElement() {
        return this.createHeader();
    }

    // Public methods to access elements
    getSearchInput() {
        return this.searchInput;
    }

    getTagSearch() {
        return this.tagSearch;
    }
}

export default Header;
