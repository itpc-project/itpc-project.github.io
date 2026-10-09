/**
 * MODAL COMPONENT CONTROLLER
 */

/**
 * Initializes a modal dialog element
 * @param {HTMLElement} modalBackdrop
 * @returns {{ open: () => void, close: () => void }}
 */
export function initModal(modalBackdrop) {
  if (!modalBackdrop) return { open: () => {}, close: () => {} };

  const closeBtns = modalBackdrop.querySelectorAll('[data-modal-close]');

  const open = () => {
    modalBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modalBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', close);
  });

  // Close on backdrop click (outside modal card)
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-active')) {
      close();
    }
  });

  return { open, close };
}
