/**
 * MODAL COMPONENT CONTROLLER
 */

/**
 * Initializes a modal dialog element
 * @param {HTMLElement} modalBackdrop
 * @param {object} [options]
 * @param {boolean} [options.staticBackdrop] - If true, clicking backdrop will not close the modal
 * @returns {{ open: () => void, close: () => void }}
 */
export function initModal(modalBackdrop, options = {}) {
  if (!modalBackdrop) return { open: () => {}, close: () => {} };

  const isStatic = options.staticBackdrop ?? modalBackdrop.dataset.backdrop === 'static';
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

  // Track mousedown to prevent accidental close on mouse text selection / dragging outside
  let isMouseDownOnBackdrop = false;
  modalBackdrop.addEventListener('mousedown', (e) => {
    isMouseDownOnBackdrop = (e.target === modalBackdrop);
  });

  // Close on backdrop click (outside modal card) only if mousedown was also on backdrop
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop && isMouseDownOnBackdrop) {
      if (isStatic) {
        // Static backdrop: do not close! Shake modal card gently to notify user
        const card = modalBackdrop.querySelector('.modal-card');
        if (card) {
          card.classList.remove('modal-card-shake');
          void card.offsetWidth; // trigger reflow
          card.classList.add('modal-card-shake');
        }
        return;
      }
      close();
    }
    isMouseDownOnBackdrop = false;
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-active')) {
      if (!isStatic) {
        close();
      }
    }
  });

  return { open, close };
}
