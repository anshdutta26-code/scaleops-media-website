(() => {
  const clean = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const current = clean(location.pathname);

  document.querySelectorAll('[data-nav]').forEach((link) => {
    try {
      const target = clean(new URL(link.getAttribute('href'), location.href).pathname);
      if (current === target) link.classList.add('active');
    } catch (_) {}
  });

  document.querySelectorAll('.mobile-toggle').forEach((toggle) => {
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', 'Open navigation');
    const nav = toggle.closest('.nav')?.querySelector('.navlinks');
    const change = () => {
      if (!nav) return;
      const open = nav.classList.toggle('open');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', change);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); change(); }
    });
  });
})();
