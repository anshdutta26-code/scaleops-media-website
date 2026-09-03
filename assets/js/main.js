(() => {
  const script = document.currentScript;
  if (script?.src) {
    const brandCss = script.src.replace(/\/assets\/js\/main\.js(?:\?.*)?$/, '/assets/css/logo-fix.css?v=20260903-logo3');
    if (!document.querySelector('link[data-scaleops-brand-fix]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = brandCss;
      link.dataset.scaleopsBrandFix = 'true';
      document.head.appendChild(link);
    }

    const brandMark = script.src.replace(/\/assets\/js\/main\.js(?:\?.*)?$/, '/assets/images/logo-mark.svg?v=20260903-logo3');
    const style = document.createElement('style');
    style.textContent = `
      .hero-art.home::before,.contact-art::before{
        content:"";position:absolute;z-index:2;pointer-events:none;
        left:25%;right:25%;top:13%;bottom:24%;
        background:url("${brandMark}") center/contain no-repeat;
        filter:drop-shadow(0 0 24px rgba(47,128,237,.48));
      }
      .contact-art::before{left:30%;right:30%;top:15%;bottom:25%;}
      @media(max-width:820px){.hero-art.home::before{left:22%;right:22%;top:12%;bottom:22%;}.contact-art::before{left:28%;right:28%;}}
    `;
    document.head.appendChild(style);
  }

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
    toggle.setAttribute('role','button');
    toggle.setAttribute('tabindex','0');
    toggle.addEventListener('click', change);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); change(); }
    });
  });

  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('calendar-title');
  const hiddenDate = document.getElementById('preferred-date');
  const prev = document.getElementById('cal-prev');
  const next = document.getElementById('cal-next');

  if (grid && title && hiddenDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = '';

    const iso = (d) => {
      const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };

    const render = () => {
      grid.innerHTML = '';
      title.textContent = cursor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
      ['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach((d)=>{
        const span=document.createElement('span'); span.className='dow'; span.textContent=d; grid.appendChild(span);
      });
      const firstDay=(cursor.getDay()+6)%7;
      const days=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
      for(let i=0;i<firstDay;i++){
        const blank=document.createElement('button'); blank.type='button'; blank.className='day muted'; blank.disabled=true; grid.appendChild(blank);
      }
      for(let n=1;n<=days;n++){
        const d=new Date(cursor.getFullYear(),cursor.getMonth(),n);
        const button=document.createElement('button');
        button.type='button'; button.className='day'; button.textContent=String(n);
        if(d<today){ button.classList.add('muted'); button.disabled=true; }
        const value=iso(d);
        if(value===selected) button.classList.add('selected');
        if(!button.disabled) button.addEventListener('click',()=>{
          selected=value; hiddenDate.value=value; render();
        });
        grid.appendChild(button);
      }
      if (prev) {
        const prior = new Date(cursor.getFullYear(), cursor.getMonth()-1, 1);
        prev.disabled = prior < new Date(today.getFullYear(), today.getMonth(), 1);
      }
    };
    prev?.addEventListener('click',()=>{ cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1); render(); });
    next?.addEventListener('click',()=>{ cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1); render(); });
    render();
  }

  const form = document.querySelector('#lead-form');
  if (form) form.addEventListener('submit', (e) => {
    if (hiddenDate && !hiddenDate.value) {
      e.preventDefault();
      alert('Please select a preferred date.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  });
})();