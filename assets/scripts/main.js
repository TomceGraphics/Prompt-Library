import { loadAndMergePatterns } from './json.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const tagFilterBtn = document.getElementById('tagFilterBtn');
const viewToggleBtn = document.getElementById('viewToggleBtn');
const cardsContainer = document.getElementById('cardsContainer');
const tagSearchPopup = document.getElementById('tagSearchPopup');
const popupTagSearch = document.getElementById('popupTagSearch');
const popupTagList = document.getElementById('popupTagList');
const selectedTagsContainer = document.querySelector('.selected-tags-container');

// State
let patterns = [];
let filteredPatterns = [];
let allTags = new Set();
let selectedTags = new Set();
let isGridView = true;

// Initialize the application
async function init() {
  try {
    const { mergedPatterns, allTags: tags } = await loadAndMergePatterns();
    patterns = mergedPatterns || [];
    allTags = new Set(tags || []);
    filteredPatterns = [...patterns];
    
    // Initialize view and theme
    initView();
    initTheme();
    
    loadPatterns(); // Call loadPatterns after patterns are loaded
    
    renderPatterns();
    renderTagList();
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing application:', error);
    cardsContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load patterns. ${error.message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
      </div>`;
  }
}

// Extract all unique tags from patterns
function extractAllTags() {
  patterns.forEach(pattern => {
    if (Array.isArray(pattern.tags)) {
      pattern.tags.forEach(tag => allTags.add(tag));
    }
  });
}

// Render patterns based on current filters
function renderPatterns() {
  if (filteredPatterns.length === 0) {
    cardsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No patterns found matching your criteria.</p>
      </div>`;
    return;
  }

  cardsContainer.className = `cards-container ${isGridView ? 'grid-view' : 'list-view'}`;
  
  cardsContainer.innerHTML = filteredPatterns.map((pattern, index) => `
    <article class="card" data-pattern-name="${escapeHtml(pattern.patternName)}">
      <div class="card-header">
        <div class="card-title-row">
          <h2 class="card-title">${escapeHtml(pattern.patternName)}</h2>
          <div class="card-actions">
            <button class="favorite-btn icon-button" data-favorite="${pattern.isFavorite}" aria-label="${pattern.isFavorite ? 'Remove from' : 'Add to'} favorites">
              <i class="${pattern.isFavorite ? 'fas' : 'far'} fa-star"></i>
            </button>
            <button class="copy-btn icon-button" aria-label="Copy pattern">
              <i class="far fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="card-tags">
          ${(pattern.tags || []).map(tag => `
            <span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>
          `).join('')}
        </div>
      </div>
      <div class="card-content">
        <div class="card-description">
          <p>${escapeHtml(pattern.description || 'No description available.')}</p>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn expand-btn" data-index="${index}" aria-expanded="false" aria-controls="pattern-${index}">
          <i class="fas fa-chevron-down"></i>
          <span>Show Pattern</span>
        </button>
      </div>
      ${pattern.pattern_extract ? `
        <div id="pattern-${index}" class="card-pattern" style="display: none;">
          <div class="pattern-header">
            <button class="pattern-copy-btn" aria-label="Copy pattern">
              <i class="far fa-copy"></i>
              <span>Copy</span>
            </button>
          </div>
          <div class="pattern-content">
            <pre><code>${escapeHtml(pattern.pattern_extract)}</code></pre>
          </div>
        </div>
      ` : ''}
    </article>`).join('');

  // Handle expand/collapse of pattern content
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const card = btn.closest('.card');
      const patternContent = card.querySelector('.card-pattern');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Toggle the expanded state
      const newExpandedState = !isExpanded;
      btn.setAttribute('aria-expanded', newExpandedState);
      
      // Toggle the content
      if (patternContent) {
        if (newExpandedState) {
          patternContent.style.display = 'block';
          patternContent.style.maxHeight = patternContent.scrollHeight + 'px';
        } else {
          patternContent.style.maxHeight = '0';
          // Wait for the transition to complete before hiding
          setTimeout(() => {
            if (btn.getAttribute('aria-expanded') === 'false') {
              patternContent.style.display = 'none';
            }
          }, 300);
        }
      }
      
      // Toggle the chevron icon
      const icon = btn.querySelector('i');
      if (icon) {
        icon.style.transform = newExpandedState ? 'rotate(180deg)' : 'rotate(0deg)';
      }
      
      // Update button text
      const textSpan = btn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = newExpandedState ? 'Hide Pattern' : 'Show Pattern';
      }
    });
  });

  // Handle copy button in pattern content
  document.querySelectorAll('.pattern-copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const card = btn.closest('.card');
      const patternContent = card?.querySelector('pre code')?.textContent;
      
      if (patternContent) {
        try {
          await copyToClipboard(patternContent);
          
          // Update button state
          btn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
          btn.classList.add('copied');
          
          // Reset button after delay
          setTimeout(() => {
            btn.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>';
            btn.classList.remove('copied');
          }, 2000);
          
          showToast('Pattern copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy pattern:', err);
          showToast('Failed to copy pattern', 'error');
        }
      }
    });
  });

  // Handle copy button in card header
  document.querySelectorAll('.card-actions .copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const card = btn.closest('.card');
      const patternName = card?.dataset.patternName;
      const pattern = patterns.find(p => p.patternName === patternName);
      
      if (pattern?.pattern_extract) {
        try {
          await copyToClipboard(pattern.pattern_extract);
          
          // Update button state
          btn.innerHTML = '<i class="fas fa-check"></i>';
          btn.classList.add('copied');
          
          // Reset button after delay
          setTimeout(() => {
            btn.innerHTML = '<i class="far fa-copy"></i>';
            btn.classList.remove('copied');
          }, 2000);
          
          showToast('Pattern copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy pattern:', err);
          showToast('Failed to copy pattern', 'error');
        }
      }
    });
  });

  // Add event listeners to the new elements
  document.querySelectorAll('.card .tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagName = tag.dataset.tag;
      if (tagName) {
        toggleTag(tagName);
      }
    });
  });
}

// Render the tag list in the popup
function renderTagList(filter = '') {
  const filteredTags = Array.from(allTags).filter(tag => 
    tag.toLowerCase().includes(filter.toLowerCase())
  );

  popupTagList.innerHTML = filteredTags.map(tag => `
    <li 
      class="tag-item ${selectedTags.has(tag) ? 'selected' : ''}" 
      data-tag="${escapeHtml(tag)}"
      role="option"
      aria-selected="${selectedTags.has(tag)}"
    >
      <span class="tag-text">${escapeHtml(tag)}</span>
    </li>
  `).join('');

  // Add event listeners to tag items
  document.querySelectorAll('.tag-item').forEach(item => {
    item.addEventListener('click', () => {
      const tag = item.dataset.tag;
      toggleTag(tag);
    });
  });
}

// Toggle a tag in the selected tags
function toggleTag(tag) {
  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
  } else {
    selectedTags.add(tag);
  }
  renderSelectedTags();
  filterPatterns();
  renderTagList(popupTagSearch.value);
}

// Render the selected tags
function renderSelectedTags() {
  const noTagsMessage = '<span class="no-tags" style="display: ' + (selectedTags.size === 0 ? 'block' : 'none') + ';">No filters selected</span>';
  const tagsHtml = selectedTags.size > 0 ? Array.from(selectedTags).map(tag => `
    <span class="selected-tag">
      ${escapeHtml(tag)}
      <button class="remove-tag" data-tag="${escapeHtml(tag)}" aria-label="Remove tag">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `).join('') : '';
  
  selectedTagsContainer.innerHTML = noTagsMessage + tagsHtml;
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = btn.dataset.tag;
      selectedTags.delete(tag);
      renderSelectedTags();
      filterPatterns();
      renderTagList(popupTagSearch.value);
    });
  });
}

// Filter patterns based on search and selected tags
function filterPatterns() {
  const searchTerm = searchInput.value.toLowerCase();
  
  filteredPatterns = patterns.filter(pattern => {
    // Filter by search term
    const matchesSearch = pattern.patternName.toLowerCase().includes(searchTerm) ||
                         pattern.description.toLowerCase().includes(searchTerm) ||
                         (pattern.tags || []).some(tag => tag.toLowerCase().includes(searchTerm));
    
    // Filter by selected tags
    const matchesTags = selectedTags.size === 0 || 
                       (pattern.tags && Array.isArray(pattern.tags) && 
                        Array.from(selectedTags).every(tag => pattern.tags.includes(tag)));
    
    return matchesSearch && matchesTags;
  });

  renderPatterns();
}

// Toggle view between grid and list
function toggleView(viewType) {
  isGridView = viewType === 'grid';
  
  // Update the view toggle buttons
  const gridOption = document.querySelector('.grid-view-option');
  const listOption = document.querySelector('.list-view-option');
  
  // Update ARIA attributes
  gridOption.setAttribute('aria-pressed', isGridView);
  listOption.setAttribute('aria-pressed', !isGridView);
  
  // Update active class
  if (isGridView) {
    gridOption.classList.add('active');
    listOption.classList.remove('active');
  } else {
    gridOption.classList.remove('active');
    listOption.classList.add('active');
  }
  
  // Update the cards container class
  cardsContainer.className = `cards-container ${isGridView ? 'grid-view' : 'list-view'}`;
  
  // Save preference
  localStorage.setItem('viewPreference', isGridView ? 'grid' : 'list');
}

// Initialize the view based on saved preference or default to grid
function initView() {
  const savedView = localStorage.getItem('viewPreference') || 'grid';
  toggleView(savedView);
}

// Initialize theme based on user preference or system preference
function initTheme() {
  // Theme is already set by the inline script in the head
  // Just update the toggle button state
  updateThemeToggle();
  
  // Listen for system theme changes
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', (e) => {
    // Only update if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      const isDark = e.matches;
      document.documentElement.classList.toggle('dark-theme', isDark);
      updateThemeToggle();
    }
  });
}

// Toggle theme between light and dark
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-theme');
  
  // Save user preference
  if (isDark) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  
  updateThemeToggle();
}

// Update the theme toggle button state
function updateThemeToggle() {
  const isDark = document.documentElement.classList.contains('dark-theme');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  if (isDark) {
    themeIcon.className = 'fas fa-sun';
    themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    themeIcon.className = 'fas fa-moon';
    themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger reflow
  toast.offsetHeight;
  
  // Add show class
  toast.classList.add('show');
  
  // Remove toast after animation
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Load patterns from localStorage
function loadPatterns() {
  const savedPatterns = localStorage.getItem('favoritePatterns');
  if (savedPatterns) {
    try {
      const favoriteStates = JSON.parse(savedPatterns);
      patterns.forEach(pattern => {
        if (favoriteStates[pattern.patternName] !== undefined) {
          pattern.isFavorite = favoriteStates[pattern.patternName];
        }
      });
    } catch (e) {
      console.error('Failed to load favorite patterns:', e);
    }
  }
  renderPatterns();
}

// Save favorite states to localStorage
function savePatterns() {
  try {
    const favoriteStates = {};
    patterns.forEach(pattern => {
      favoriteStates[pattern.patternName] = pattern.isFavorite || false;
    });
    localStorage.setItem('favoritePatterns', JSON.stringify(favoriteStates));
  } catch (e) {
    console.error('Failed to save favorite patterns:', e);
  }
}

// Set up event listeners
function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', debounce(filterPatterns, 300));
  
  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // View toggle buttons
  document.querySelectorAll('.view-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const viewType = e.currentTarget.dataset.view;
      toggleView(viewType);
    });
  });
  
  // Tag filter button
  tagFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tagSearchPopup.classList.toggle('hidden');
    tagFilterBtn.setAttribute('aria-expanded', 
      tagFilterBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
    
    if (!tagSearchPopup.classList.contains('hidden')) {
      popupTagSearch.focus();
    }
  });
  
  // Tag search in popup
  popupTagSearch.addEventListener('input', (e) => {
    renderTagList(e.target.value);
  });
  
  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!tagSearchPopup.contains(e.target) && e.target !== tagFilterBtn) {
      tagSearchPopup.classList.add('hidden');
      tagFilterBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Prevent popup from closing when clicking inside it
  tagSearchPopup.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Keyboard navigation for accessibility
  popupTagSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      tagSearchPopup.classList.add('hidden');
      tagFilterBtn.setAttribute('aria-expanded', 'false');
      tagFilterBtn.focus();
    }
  });

  // Favorite button
  document.addEventListener('click', (e) => {
    const favoriteBtn = e.target.closest('.favorite-btn');
    if (favoriteBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const card = favoriteBtn.closest('.card');
      if (card) {
        const patternName = card.dataset.patternName;
        if (patternName) {
          const pattern = patterns.find(p => p.patternName === patternName);
          if (pattern) {
            pattern.isFavorite = !pattern.isFavorite;
            favoriteBtn.setAttribute('data-favorite', pattern.isFavorite);
            favoriteBtn.setAttribute('aria-label', pattern.isFavorite ? 'Remove from favorites' : 'Add to favorites');
            const icon = favoriteBtn.querySelector('i');
            if (icon) {
              icon.className = pattern.isFavorite ? 'fas fa-star' : 'far fa-star';
            }
            savePatterns();
          }
        }
      }
      return;
    }
  });
}

// Debounce function to limit the rate of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);