import { state, persist } from './state.js';
import { loadAndRenderPrompts } from './prompts.js';
import { navigation } from './data.js';

// Utility functions
const qs = (id) => document.getElementById(id);

// Constants
const ACTIVE_CLASSES = ['text-blue-600', 'dark:text-blue-400', 'bg-blue-100', 'dark:bg-blue-950/50'];

function createNavigationItems() {
    const navContainer = document.querySelector('nav .space-y-1');
    if (!navContainer) return;

    // Clear existing items
    navContainer.innerHTML = '';

    // Create new items from navigation data
    navigation.tabs.forEach(tab => {
        const tabElement = document.createElement('a');
        tabElement.href = '#';
        tabElement.dataset.tab = tab.id;
        tabElement.className = 'tab-link flex items-center px-3 py-2 text-sm font-medium rounded-md group';
        tabElement.setAttribute('role', 'tab');
        tabElement.setAttribute('aria-selected', 'false');
        
        tabElement.innerHTML = `
            <iconify-icon icon="${tab.icon}" class="flex-shrink-0"></iconify-icon>
            <span class="sidebar-text ml-3">${tab.label}</span>
        `;
        
        navContainer.appendChild(tabElement);
    });
}

function setActiveTabUI(tabName) {
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(el => {
        // Remove active classes
        el.classList.remove(...ACTIVE_CLASSES);
        el.setAttribute('aria-selected', 'false');
        
        // Add active classes if this is the current tab
        if (el.getAttribute('data-tab') === tabName) {
            el.classList.add(...ACTIVE_CLASSES);
            el.setAttribute('aria-selected', 'true');
        }
        
        // Set tooltip for collapsed state
        const text = el.querySelector('.sidebar-text');
        el.setAttribute('title', text ? text.textContent : '');
    });
}

function applySidebarCollapsedUI(collapsed) {
    const sidebar = qs('sidebar');
    const toggle = qs('sidebar-toggle');
    
    if (!sidebar || !toggle) return;
    
    if (collapsed) {
        sidebar.classList.add('collapsed');
        toggle.innerHTML = '<iconify-icon icon="lucide:panel-left-open" class="text-xl"></iconify-icon>';
    } else {
        sidebar.classList.remove('collapsed');
        toggle.innerHTML = '<iconify-icon icon="lucide:panel-left-close" class="text-xl"></iconify-icon>';
    }
}

function handleKeyboardNav(e) {
    const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
    if (!tabLinks.length) return;
    
    const currentIdx = tabLinks.findIndex(el => el.getAttribute('data-tab') === state.currentTab);
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = tabLinks[(currentIdx + 1) % tabLinks.length];
        next?.focus();
        next?.click();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = tabLinks[(currentIdx - 1 + tabLinks.length) % tabLinks.length];
        prev?.focus();
        prev?.click();
    }
}

export function setupSidebar() {
    const themeToggle = qs('theme-toggle');
    const sidebarToggle = qs('sidebar-toggle');
    
    // Apply initial states
    applySidebarCollapsedUI(state.sidebarCollapsed);
    createNavigationItems();
    setActiveTabUI(state.currentTab);
    
    // Theme toggle
    themeToggle?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        persist.theme(isDark ? 'dark' : 'light');
    });
    
    // Sidebar toggle
    sidebarToggle?.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        persist.sidebarCollapsed(state.sidebarCollapsed);
        applySidebarCollapsedUI(state.sidebarCollapsed);
    });
    
    // Tab navigation
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            if (!tabName) return;
            
            state.currentTab = tabName;
            persist.activeTab(tabName);
            setActiveTabUI(tabName);
            loadAndRenderPrompts();
        });
        
        // Keyboard support
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });
    
    // Keyboard navigation
    const sidebar = qs('sidebar');
    sidebar?.addEventListener('keydown', handleKeyboardNav);
}