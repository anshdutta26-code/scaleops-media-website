(()=>{
  const scriptEl=document.currentScript;
  const assetRoot=scriptEl?new URL('../',scriptEl.src):new URL('assets/',location.href);
  const image=name=>new URL('images/'+name,assetRoot).href;
  const assetVersion='v3-20260904';
  const mark=image('logo-mark.svg')+'?v='+assetVersion;

  const icon=document.querySelector('link[rel~="icon"]'); if(icon) icon.href=mark;
  document.querySelectorAll('.core-logo,footer .footer-brand img,.top .brand img').forEach(img=>img.src=mark);

  const services=document.querySelector('#services'); if(services) services.dataset.scene='services';
  const insights=document.querySelector('#insights'); if(insights) insights.dataset.scene='insights';
  const transition=[...document.querySelectorAll('.scene[data-scene="rupee"]')][0]; if(transition) transition.dataset.scene='transition';
  const orbitScenes=[...document.querySelectorAll('.scene[data-scene="orbit"]')]; if(orbitScenes[1]) orbitScenes[1].dataset.scene='process';

  const proof=document.querySelector('#proof');
  if(proof&&!document.querySelector('#case-studies')){
    const cases=document.createElement('section');
    cases.id='case-studies'; cases.className='scene'; cases.dataset.scene='cases';
    cases.innerHTML='<div class="copy left"><p class="eyebrow">Case studies</p><h2>Real operating problems. Systems built around the constraint.</h2><p class="lead">The strongest growth work usually starts behind the campaign report: with the handoff, funnel, data or process quietly limiting performance.</p></div><div class="copy right case-list"><article><b>Funnel + Revenue</b><span>Rebuilt the path from demand to conversion and removed process leakage.</span></article><article><b>Order Automation</b><span>Connected intake, validation, API execution, status updates and communication.</span></article><article><b>Retail Decision System</b><span>Turned fragmented operating data into management-ready visibility and action.</span></article></div>';
    proof.insertAdjacentElement('afterend',cases);
    const dnav=document.querySelector('.top nav'),ins=dnav?.querySelector('a[href="#insights"]');
    if(dnav&&ins){const a=document.createElement('a');a.href='#case-studies';a.textContent='Case Studies';dnav.insertBefore(a,ins)}
    const mnav=document.querySelector('.mobile-nav'),mins=mnav?.querySelector('a[href="#insights"]');
    if(mnav&&mins){const a=document.createElement('a');a.href='#case-studies';a.textContent='Case Studies';mnav.insertBefore(a,mins)}
  }

  const menu=document.querySelector('.menu'),mobile=document.querySelector('.mobile-nav');
  if(menu&&mobile){
    menu.addEventListener('click',()=>mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
  }

  const stage=document.querySelector('.stage');
  if(stage){
    stage.querySelectorAll('.stage-fx,.stage-canvas,.scene-art-layer').forEach(el=>el.remove());
    const lowFi=stage.querySelector('.stage-graphics'); if(lowFi) lowFi.remove();
    const tags=stage.querySelector('.hub-tags'); if(tags) tags.remove();
    const layer=document.createElement('div'); layer.className='scene-art-layer';
    const art={
      orbit:'scene-orbit.svg',
      transition:'scene-transition.svg',
      hub:'scene-hub.svg',
      services:'scene-services.svg',
      proof:'scene-proof.svg',
      insights:'scene-insights.svg'
    };
    Object.entries(art).forEach(([key,file])=>{
      const img=document.createElement('img');
      img.className=`scene-art art-${key}`; img.dataset.art=key; img.src=image(file)+'?v='+assetVersion; img.alt='';
      layer.appendChild(img);
    });
    stage.insertBefore(layer,stage.querySelector('.rings'));
  }

  const allScenes=[...document.querySelectorAll('[data-scene]')];
  const navLinks=[...document.querySelectorAll('.top nav a[href^="#"]')];
  const artMap={logo:'orbit',orbit:'orbit',process:'orbit',transition:'transition',hub:'hub',services:'services',proof:'proof',cases:'proof',insights:'insights',return:'orbit',final:'orbit'};
  const setStage=()=>{
    const probe=innerWidth<=760?innerHeight*.72:innerHeight*.52;
    let current=allScenes[0];
    for(const scene of allScenes){const r=scene.getBoundingClientRect();if(r.top<=probe&&r.bottom>=probe){current=scene;break}}
    if(!current)return;
    const key=current.dataset.scene;
    document.body.dataset.stage=key;
    const activeArt=artMap[key]||'orbit';
    document.querySelectorAll('.scene-art').forEach(el=>el.classList.toggle('active',el.dataset.art===activeArt));
    const id=current.id;
    navLinks.forEach(a=>a.classList.toggle('active',Boolean(id)&&a.getAttribute('href')===`#${id}`));
  };
  addEventListener('scroll',setStage,{passive:true}); addEventListener('resize',setStage); setStage();

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
  document.querySelectorAll('.copy,.metric,.glass,.stack article,.grid article,.service-list article,.process article,.insight-list article,.case-list article').forEach(el=>{el.classList.add('reveal');io.observe(el)});

  if(stage&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.addEventListener('pointermove',e=>{
      if(innerWidth<1180)return;
      const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
      stage.style.transform=`translate(-50%,-47%) rotateY(${x*.75}deg) rotateX(${-y*.5}deg)`;
    });
    document.addEventListener('pointerleave',()=>{if(innerWidth>=1180)stage.style.transform='translate(-50%,-47%)'});
  }
})();