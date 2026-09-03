(() => {
  const stack = document.getElementById('rupeeStack');
  const scene = document.querySelector('.scene');
  if (stack && !stack.children.length) {
    for (let i = 1; i <= 28; i++) {
      const layer = document.createElement('span');
      layer.textContent = '₹';
      layer.style.transform = `translateZ(${-i}px) translate(${i*.18}px,${i*.12}px)`;
      layer.style.opacity = String(.84 - i*.018);
      stack.appendChild(layer);
    }
  }
  const sections=[...document.querySelectorAll('[data-scene]')];
  if(scene && sections.length){
    const io=new IntersectionObserver(entries=>{
      const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(active) scene.dataset.mode=active.target.dataset.scene;
    },{threshold:[.18,.35,.55,.75]});
    sections.forEach(s=>io.observe(s));
  }

  let tx=0,ty=0,px=0,py=0;
  const rupee=document.getElementById('rupeeStage');
  window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*10;ty=(e.clientY/innerHeight-.5)*-8},{passive:true});
  const animate=()=>{px+=(tx-px)*.05;py+=(ty-py)*.05;if(rupee){rupee.style.marginLeft=`${px*.28}px`;rupee.style.marginTop=`${py*.28}px`}requestAnimationFrame(animate)};
  animate();
  window.addEventListener('scroll',()=>{const y=scrollY;document.querySelectorAll('.mini-card,.service-card').forEach((card,i)=>{card.style.marginTop=`${Math.sin(y/340+i*1.15)*5}px`})},{passive:true});

  const menuBtn=document.querySelector('.mobile-menu'),nav=document.querySelector('.topbar nav');
  menuBtn?.addEventListener('click',()=>{nav?.classList.toggle('open');menuBtn.textContent=nav?.classList.contains('open')?'✕':'☰'});

  const grid=document.getElementById('calendar-grid'),title=document.getElementById('calendar-title'),hidden=document.getElementById('preferred-date');
  if(grid&&title&&hidden){
    const today=new Date();today.setHours(0,0,0,0);let cursor=new Date(today.getFullYear(),today.getMonth(),1),selected='';
    const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const render=()=>{
      grid.innerHTML='';title.textContent=cursor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
      ['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach(v=>{const s=document.createElement('span');s.className='dow';s.textContent=v;grid.appendChild(s)});
      const offset=(cursor.getDay()+6)%7,days=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
      for(let i=0;i<offset;i++){const b=document.createElement('button');b.type='button';b.className='muted';b.disabled=true;grid.appendChild(b)}
      for(let d=1;d<=days;d++){const date=new Date(cursor.getFullYear(),cursor.getMonth(),d),b=document.createElement('button');b.type='button';b.textContent=d;
        const value=iso(date);if(date<today){b.className='muted';b.disabled=true}else if(value===selected)b.className='selected';
        if(!b.disabled)b.addEventListener('click',()=>{selected=value;hidden.value=value;render()});grid.appendChild(b)}
    };
    document.getElementById('cal-prev')?.addEventListener('click',()=>{const prev=new Date(cursor.getFullYear(),cursor.getMonth()-1,1),floor=new Date(today.getFullYear(),today.getMonth(),1);if(prev>=floor){cursor=prev;render()}});
    document.getElementById('cal-next')?.addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()});
    render();
  }
  const form=document.getElementById('lead-form');
  form?.addEventListener('submit',e=>{if(hidden&&!hidden.value){e.preventDefault();alert('Please select a preferred date.');return}const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Sending…'}});
})();