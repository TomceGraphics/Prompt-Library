import { state } from './state.js';

function qs(id) { return document.getElementById(id); }

export function setupModal() {
    const promptModal = qs('prompt-modal');
    const closeModal = qs('close-modal');
    const modalTitle = qs('modal-title');
    const modalTags = qs('modal-tags');
    const modalDescription = qs('modal-description');
    const modalPrompt = qs('modal-prompt');
    const modalFavorite = qs('modal-favorite');
    const modalCopy = qs('modal-copy');

    closeModal?.addEventListener('click', () => {
        promptModal?.classList.add('hidden');
    });

    promptModal?.addEventListener('click', (e) => {
        if (e.target === promptModal) promptModal.classList.add('hidden');
    });

    window.addEventListener('open-prompt-modal', (e) => {
        const prompt = e.detail?.prompt;
        if (!prompt) return;
        const isFavorite = state.favorites.includes(prompt.id);
        modalTitle && (modalTitle.textContent = prompt.id || '');
        modalDescription && (modalDescription.textContent = prompt.description || '');
        modalPrompt && (modalPrompt.textContent = prompt.system || '');

        if (modalTags) {
            modalTags.innerHTML = '';
            (prompt.tags || []).forEach((tag) => {
                const el = document.createElement('span');
                el.className = 'px-2 py-1 bg-gray-100 dark:bg-gray-800/50  rounded-full text-xs';
                el.textContent = tag;
                modalTags.appendChild(el);
            });
        }

        if (modalFavorite) {
            modalFavorite.innerHTML = `
                <iconify-icon icon="${isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}" class="text-xl ${isFavorite ? 'text-red-500' : ''}"></iconify-icon>
                <span>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            `;
        }

        modalFavorite?.addEventListener('click', () => {
            const evt = new CustomEvent('toggle-favorite-from-modal', { detail: { promptId: prompt.id } });
            window.dispatchEvent(evt);
        }, { once: true });

        modalCopy?.addEventListener('click', () => {
            const evt = new CustomEvent('copy-from-modal', { detail: { text: prompt.system } });
            window.dispatchEvent(evt);
        }, { once: true });

        promptModal?.classList.remove('hidden');
    });
}


