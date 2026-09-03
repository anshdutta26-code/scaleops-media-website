(() => {
  const clean = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  const current = clean(location.pathname);
  document.querySelectorAll('[data-nav]').forEach((link) => {
    try {
      const target = clean(new URL(link.getAttribute('href'), location.href).pathname);
      if (current === target || (target !== '/' && current.startsWith(target))) link.classList.add('active');
    } catch (_) {}
  });
  document.querySelectorAll('.mobile-toggle').forEach((toggle) => {
    const nav = toggle.closest('.nav')?.querySelector('.navlinks');
    const change = () => {
      if (!nav) return;
      const open = nav.classList.toggle('open');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.setAttribute('role','button'); toggle.setAttribute('tabindex','0');
    toggle.addEventListener('click', change);
    toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); change(); }});
  });
  const date = document.querySelector('input[type="date"]');
  if (date) {
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    date.min = today.toISOString().split('T')[0];
  }
  const form = document.querySelector('#lead-form');
  if (form) form.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  });
})();