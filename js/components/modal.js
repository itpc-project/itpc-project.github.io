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
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
  });

  // Protect modal-card from any event bubbling to backdrop
  const card = modalBackdrop.querySelector('.modal-card');
  if (card) {
    card.addEventListener('mousedown', (e) => e.stopPropagation());
    card.addEventListener('click', (e) => e.stopPropagation());
  }

  // Backdrop click handler: NEVER close when static
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      if (isStatic) {
        // Absolutely do not close when static backdrop
        return;
      }
      close();
    }
  });

  // Close on Escape key only when not static
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-active')) {
      if (!isStatic) {
        close();
      }
    }
  });

  return { open, close };
}
