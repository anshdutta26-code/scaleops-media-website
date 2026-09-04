(()=>{
  const scriptEl=document.currentScript;
  const assetRoot=scriptEl?new URL('../',scriptEl.src):new URL('assets/',location.href);
  const image=name=>new URL('images/'+name,assetRoot).href;

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

  const stage=document.querySelector('.stage');
  const menu=document.querySelector('.menu'),mobile=document.querySelector('.mobile-nav');
  if(menu&&mobile){menu.addEventListener('click',()=>mobile.classList.toggle('open'));mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')))}

  const fx={
    logo:'<span class="fx-tower ft1"><i></i><i></i><i></i></span><span class="fx-tower ft2"><i></i><i></i><i></i></span><span class="fx-panel fpnl1"><i></i><i></i><i></i></span><span class="fx-panel fpnl2"><i></i><i></i><i></i><i></i></span><span class="fx-cube fc1"></span><span class="fx-cube fc2"></span><span class="fx-cube fc3"></span>',
    orbit:'<span class="fx-orb fo1"><i></i></span><span class="fx-orb fo2"><i></i></span><span class="fx-orb fo3"><i></i></span><span class="fx-orb fo4"><i></i></span><span class="fx-orb fo5"><i></i></span><span class="fx-trace trace1"></span><span class="fx-trace trace2"></span>',
    transition:'<span class="fx-beam fb1"></span><span class="fx-beam fb2"></span><span class="fx-beam fb3"></span><span class="fx-pulse pulse1"></span><span class="fx-pulse pulse2"></span><span class="fx-cube fc1"></span><span class="fx-cube fc3"></span>',
    hub:'<span class="fx-node fn1">↗</span><span class="fx-node fn2">▽</span><span class="fx-node fn3">✦</span><span class="fx-node fn4">⚙</span><span class="fx-node fn5">▥</span><span class="fx-node fn6">◎</span><span class="fx-link fl1"></span><span class="fx-link fl2"></span><span class="fx-link fl3"></span>',
    services:`<img class="fx-graphic services-graphic" src="${image('services-stack.svg')}" alt=""><span class="fx-service fs1">↗</span><span class="fx-service fs2">▽</span><span class="fx-service fs3">⚙</span><span class="fx-service fs4">✦</span>`,
    proof:`<img class="fx-graphic proof-graphic" src="${image('dashboard-graph.svg')}" alt=""><span class="fx-bar fbar1"></span><span class="fx-bar fbar2"></span><span class="fx-bar fbar3"></span><span class="fx-bar fbar4"></span><span class="fx-glowdot gd1"></span><span class="fx-glowdot gd2"></span>`,
    cases:`<img class="fx-graphic cases-graphic" src="${image('case-network.svg')}" alt=""><span class="fx-cube fc1"></span><span class="fx-cube fc2"></span><span class="fx-cube fc3"></span><span class="fx-cube fc4"></span>`,
    process:'<span class="fx-step st1"><i></i></span><span class="fx-step st2"><i></i></span><span class="fx-step st3"><i></i></span><span class="fx-step st4"><i></i></span><span class="fx-step st5"><i></i></span><span class="fx-flow flow1"></span><span class="fx-flow flow2"></span>',
    insights:`<img class="fx-graphic insights-graphic" src="${image('insights-servers.svg')}" alt=""><span class="fx-data fd1"><i></i><i></i><i></i></span><span class="fx-data fd2"><i></i><i></i><i></i></span><span class="fx-data fd3"><i></i><i></i><i></i></span>`,
    return:'<span class="return-arc"></span><span class="return-arc alt"></span><span class="fx-cube fc1"></span><span class="fx-cube fc2"></span><span class="fx-pulse pulse1"></span>',
    final:'<span class="fx-final-halo"></span><span class="fx-final-ring fr1"></span><span class="fx-final-ring fr2"></span>'
  };

  if(stage){
    stage.querySelectorAll('.stage-fx,.stage-canvas').forEach(el=>el.remove());
    const c=document.createElement('canvas'); c.className='stage-canvas'; stage.prepend(c);
    Object.entries(fx).forEach(([key,html])=>{const d=document.createElement('div');d.className=`stage-fx fx-${key}`;d.dataset.fx=key;d.innerHTML=html;stage.appendChild(d)});
    const ctx=c.getContext('2d');let w=0,h=0,dpr=1,pts=[];
    const resize=()=>{dpr=Math.min(devicePixelRatio||1,2);const r=c.getBoundingClientRect();w=r.width;h=r.height;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);pts=Array.from({length:48},()=>({a:Math.random()*Math.PI*2,r:.2+Math.random()*.35,s:.00045+Math.random()*.001,z:.35+Math.random()*.65}))};
    const draw=()=>{ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2;for(const p of pts){p.a+=p.s*16;const x=cx+Math.cos(p.a)*w*p.r,y=cy+Math.sin(p.a)*h*p.r*.42;ctx.beginPath();ctx.arc(x,y,1.1*p.z,0,Math.PI*2);ctx.fillStyle=p.z>.7?`rgba(105,216,255,${.14+.42*p.z})`:`rgba(118,87,255,${.12+.35*p.z})`;ctx.fill()}requestAnimationFrame(draw)};
    resize(); addEventListener('resize',resize); if(!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
  }

  const allScenes=[...document.querySelectorAll('[data-scene]')];
  const navLinks=[...document.querySelectorAll('.top nav a[href^="#"]')];
  const setStage=()=>{
    const probe=innerWidth<=760?innerHeight*.66:innerHeight*.52;let current=allScenes[0];
    for(const scene of allScenes){const r=scene.getBoundingClientRect();if(r.top<=probe&&r.bottom>=probe){current=scene;break}}
    if(!current)return; const key=current.dataset.scene; document.body.dataset.stage=key;
    document.querySelectorAll('.stage-fx').forEach(el=>el.classList.toggle('active',el.dataset.fx===key));
    const id=current.id; navLinks.forEach(a=>a.classList.toggle('active',id&&a.getAttribute('href')===`#${id}`));
  };
  addEventListener('scroll',setStage,{passive:true}); addEventListener('resize',setStage); setStage();

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1});
  document.querySelectorAll('.copy,.metric,.glass,.stack article,.grid article,.service-list article,.process article,.insight-list article,.case-list article').forEach(el=>{el.classList.add('reveal');io.observe(el)});

  document.addEventListener('pointermove',e=>{if(innerWidth<980||!stage)return;const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;stage.style.transform=`translate(-50%,-46%) rotateY(${x*1.4}deg) rotateX(${-y*1.0}deg)`});
  document.addEventListener('pointerleave',()=>{if(stage&&innerWidth>=980)stage.style.transform='translate(-50%,-46%)'});
})();