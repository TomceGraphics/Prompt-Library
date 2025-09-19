// Central app state and persistence helpers

const STORAGE_KEYS = {
    favorites: 'favorites',
    sidebarCollapsed: 'sidebarCollapsed',
    theme: 'theme',
    activeTab: 'activeTab',
};

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export const state = {
    currentView: 'card',
    currentPromptId: null,
    favorites: readJson(STORAGE_KEYS.favorites, []),
    selectedTags: [],
    allTags: [],
    currentTab: localStorage.getItem(STORAGE_KEYS.activeTab) || 'explore',
    sidebarCollapsed: localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === null ? true : localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true',
    theme: localStorage.getItem(STORAGE_KEYS.theme),
    promptData: { patterns: [] },
};

export const persist = {
    favorites(next) {
        writeJson(STORAGE_KEYS.favorites, next);
    },
    sidebarCollapsed(next) {
        localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(next));
    },
    theme(next) {
        localStorage.setItem(STORAGE_KEYS.theme, next);
    },
    activeTab(next) {
        localStorage.setItem(STORAGE_KEYS.activeTab, next);
    },
};
