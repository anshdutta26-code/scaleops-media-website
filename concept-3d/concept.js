(() => {
  const stack = document.getElementById('rupeeStack');
  const scene = document.querySelector('.scene');
  if (stack) {
    for (let i = 1; i <= 26; i++) {
      const layer = document.createElement('span');
      layer.textContent = '₹';
      layer.style.transform = `translateZ(${-i}px) translate(${i * .18}px, ${i * .12}px)`;
      layer.style.opacity = String(.82 - i * .018);
      stack.appendChild(layer);
    }
  }
  const sections = [...document.querySelectorAll('[data-scene]')];
  const io = new IntersectionObserver((entries) => {
    const active = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (active) scene.dataset.mode = active.target.dataset.scene;
  }, {threshold:[.2,.4,.6,.8]});
  sections.forEach(s => io.observe(s));

  let tx = 0, ty = 0, px = 0, py = 0;
  const rupee = document.getElementById('rupeeStage');
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth - .5) * 10;
    ty = (e.clientY / innerHeight - .5) * -8;
  }, {passive:true});
  const animate = () => {
    px += (tx - px) * .05;
    py += (ty - py) * .05;
    if (rupee) {
      rupee.style.marginLeft = `${px * .28}px`;
      rupee.style.marginTop = `${py * .28}px`;
    }
    requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.mini-card').forEach((card,i)=>{
      const drift = Math.sin((y/320)+(i*1.1))*7;
      card.style.marginTop = `${drift}px`;
    });
  }, {passive:true});
})();
