(()=>{
  const stage=document.querySelector('.stage');
  if(stage&&!stage.querySelector('.depth-funnel')){
    const f=document.createElement('div');f.className='depth-funnel';f.innerHTML='<span class="mouth"></span><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="ring"></span>';stage.appendChild(f);
  }
  const mark='assets/images/logo-mark.svg?v=brand-exact-20260904';
  document.querySelectorAll('.core-logo,footer .footer-brand img').forEach(img=>img.src=mark);
  const fav=document.querySelector('link[rel~="icon"]');if(fav)fav.href=mark;
  const all=[...document.querySelectorAll('[data-scene]')];
  const order=['logo','orbit','transition','hub','services','proof','cases','process','insights','return','final'];
  const set=()=>{
    const probe=innerWidth<821?innerHeight*.58:innerHeight*.5;
    let current=all[0];
    for(const s of all){const r=s.getBoundingClientRect();if(r.top<=probe&&r.bottom>=probe){current=s;break}}
    if(!current)return;let key=current.dataset.scene;if(key==='rupee')key='transition';document.body.dataset.stage=key;
    const idx=Math.max(0,order.indexOf(key));
    if(stage&&innerWidth>820){const drop=Math.min(30,idx*2.4);stage.style.top=`calc(50% + ${drop}px)`}
  };
  addEventListener('scroll',set,{passive:true});addEventListener('resize',set);set();
})();