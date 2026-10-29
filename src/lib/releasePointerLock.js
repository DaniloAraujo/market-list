export function releasePointerLock(delay = 400) {
  window.setTimeout(() => {
    const open = document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]');
    if (!open && document.body.style.pointerEvents === 'none') document.body.style.pointerEvents = '';
  }, delay);
}
