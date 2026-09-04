(() => {
  const stage = document.getElementById('cinematicStage');
  const sections = [...document.querySelectorAll('[data-stage]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const map = {logo:'',orbit:'stage-orbit',rupee:'stage-rupee','rupee-hub':'stage-rupee-hub',clear:'stage-clear',return:'stage-return','final-logo':'stage-final-logo'};
  if(stage && sections.length){
    const io = new IntersectionObserver(entries => {
      const active = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!active) return;
      stage.className = 'cinematic-stage';
      const cls = map[active.target.dataset.stage]; if(cls) stage.classList.add(cls);
      const id=active.target.id;
      if(id){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));}
    }, {threshold:[.18,.35,.55,.72]});
    sections.forEach(s=>io.observe(s));
  }
  let tx=0,ty=0,cx=0,cy=0;
  addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*18;ty=(e.clientY/innerHeight-.5)*-14},{passive:true});
  const loop=()=>{cx+=(tx-cx)*.045;cy+=(ty-cy)*.045;if(stage){stage.style.marginLeft=cx*.16+'px';stage.style.marginTop=cy*.16+'px'}requestAnimationFrame(loop)};loop();
  const menu=document.querySelector('.menu-btn'),nav=document.querySelector('.desktop-nav');
  menu?.addEventListener('click',()=>{nav?.classList.toggle('open');menu.textContent=nav?.classList.contains('open')?'✕':'☰'});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');if(menu)menu.textContent='☰'}));
})();