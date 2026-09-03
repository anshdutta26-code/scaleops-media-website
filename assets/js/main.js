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
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('calendar-title');
  const hiddenDate = document.getElementById('preferred-date');
  const prev = document.getElementById('cal-prev');
  const next = document.getElementById('cal-next');
  if (grid && title && hiddenDate) {
    const today = new Date(); today.setHours(0,0,0,0);
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = '';
    const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const render = () => {
      grid.innerHTML='';
      title.textContent = cursor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
      ['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach(d=>{const s=document.createElement('span');s.className='dow';s.textContent=d;grid.appendChild(s)});
      const first=(cursor.getDay()+6)%7, days=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
      for(let i=0;i<first;i++){const b=document.createElement('button');b.type='button';b.className='day muted';b.disabled=true;grid.appendChild(b)}
      for(let n=1;n<=days;n++){
        const d=new Date(cursor.getFullYear(),cursor.getMonth(),n), b=document.createElement('button');
        b.type='button'; b.className='day'; b.textContent=String(n);
        if(d<today){b.classList.add('muted');b.disabled=true}
        const value=iso(d);
        if(value===selected)b.classList.add('selected');
        if(!b.disabled)b.addEventListener('click',()=>{selected=value;hiddenDate.value=value;render()});
        grid.appendChild(b);
      }
      if(prev){const prior=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);prev.disabled=prior<new Date(today.getFullYear(),today.getMonth(),1)}
    };
    prev?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()});
    next?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()});
    render();
  }
  const form=document.getElementById('lead-form');
  if(form) form.addEventListener('submit', e=>{
    if(hiddenDate && !hiddenDate.value){e.preventDefault();alert('Please select a preferred date.');return;}
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='Sending…';}
  });
  document.querySelectorAll('[data-case-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-case-filter]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();