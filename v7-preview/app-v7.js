import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas=document.querySelector('#webgl');
const sections=[...document.querySelectorAll('.scene')];
const overlay=document.querySelector('#logo-overlay');
const mobile=()=>innerWidth<700, tablet=()=>innerWidth>=700&&innerWidth<1050;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu=document.querySelector('.menu'),mobileMenu=document.querySelector('.mobile-menu');
if(menu&&mobileMenu){menu.onclick=()=>mobileMenu.classList.toggle('open');mobileMenu.querySelectorAll('a').forEach(a=>a.onclick=()=>mobileMenu.classList.remove('open'));}

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){document.documentElement.classList.add('no-webgl');throw e;}
const dpr=()=>Math.min(devicePixelRatio||1,mobile()?1.2:tablet()?1.5:2);
renderer.setPixelRatio(dpr());renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=!mobile();renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();scene.background=new THREE.Color(0x01040a);scene.fog=new THREE.FogExp2(0x020711,mobile()?.019:.0125);
const camera=new THREE.PerspectiveCamera(mobile()?58:tablet()?52:45,innerWidth/innerHeight,.1,240);scene.add(camera);
const world=new THREE.Group();scene.add(world);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),mobile()?.36:.62,.58,.24));composer.addPass(new OutputPass());

const C={blue:0x2f80ed,cyan:0x69dfff,violet:0x7657ff,navy:0x07142d,deep:0x020711};
scene.add(new THREE.HemisphereLight(0x315c94,0x010307,.55));
const rim=new THREE.DirectionalLight(0x69dfff,1.6);rim.position.set(-6,7,6);scene.add(rim);
const fill=new THREE.DirectionalLight(0x7657ff,.9);fill.position.set(7,-1,2);scene.add(fill);

const loader=new THREE.TextureLoader();
const markTex=loader.load('assets/scaleops-mark.png?v=v7-2',t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());},undefined,()=>document.documentElement.classList.add('texture-fallback'));
markTex.colorSpace=THREE.SRGBColorSpace;

const line=(color=C.cyan,opacity=.28)=>new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
const glow=(color=C.cyan,opacity=.35)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const metal=(color=C.blue,em=0x082e73,ei=.9)=>new THREE.MeshPhysicalMaterial({color,emissive:em,emissiveIntensity:ei,metalness:.9,roughness:.18,clearcoat:1,clearcoatRoughness:.08});
function sprite(hex=C.blue,scale=4,opacity=.6){const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d'),g=x.createRadialGradient(80,80,0,80,80,80),h='#'+hex.toString(16).padStart(6,'0');g.addColorStop(0,'rgba(255,255,255,.96)');g.addColorStop(.08,h);g.addColorStop(.35,h+'55');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,160,160);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(scale,scale,1);return s;}
function logo(scale=3){const g=new THREE.Group(),aspect=661/433,geo=new THREE.PlaneGeometry(scale*aspect,scale);for(let i=0;i<4;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,opacity:.12+i*.08,depthWrite:false,toneMapped:false,color:i<2?0x174fbf:0x2f80ed}));m.position.set(-i*.014,i*.008,-.18+i*.045);g.add(m);}const front=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,depthWrite:false,toneMapped:false}));front.position.z=.04;front.renderOrder=10;g.add(front);const h=sprite(C.blue,scale*2.05,.5);h.position.z=-.55;g.add(h);return g;}
function sphere(r=3){return new THREE.Mesh(new THREE.SphereGeometry(r,mobile()?36:60,mobile()?24:40),new THREE.MeshPhysicalMaterial({color:0x061832,roughness:.07,metalness:.06,transmission:.26,transparent:true,opacity:.24,clearcoat:1,ior:1.3,thickness:1,emissive:0x031a40,emissiveIntensity:.5,side:THREE.DoubleSide}));}
function orbit(g,r=4.1,tilt=.22,color=C.cyan,opacity=.3){const pts=[];for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.27,Math.sin(a*2)*.05));}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),line(color,opacity));l.rotation.x=tilt;l.rotation.z=tilt*.48;g.add(l);}
function platform(g,y=-3,r=3.5){for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(r-i*.52,.016,6,96),glow(i%2?C.violet:C.cyan,.36-i*.05));t.rotation.x=Math.PI/2;t.position.y=y;t.scale.y=.6;g.add(t);}const h=sprite(C.blue,5.2,.38);h.position.y=y+.05;h.scale.y=1.05;g.add(h);}
function rupee(scale=2.1){const s=new THREE.Shape();const p=[[-.82,.88],[.82,.88],[.82,.62],[.22,.62],[.4,.45],[.82,.45],[.82,.18],[.45,.18],[.34,.02],[.06,-.16],[.72,-.9],[.28,-.9],[-.42,-.08],[-.42,.13],[-.02,.18],[-.82,.18],[-.82,.45],[-.04,.45],[-.2,.62],[-.82,.62]];s.moveTo(...p[0]);p.slice(1).forEach(q=>s.lineTo(...q));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:true,bevelThickness:.05,bevelSize:.04,bevelSegments:5,curveSegments:12});geo.center();const m=new THREE.Mesh(geo,metal(C.blue,0x0a3b99,1.1));m.scale.setScalar(scale);m.castShadow=true;const g=new THREE.Group();g.add(m);const h=sprite(C.cyan,scale*2.1,.46);h.position.z=-1;g.add(h);return g;}

function funnelWalls(){const g=new THREE.Group(),steps=28,levels=6;for(const side of [-1,1]){const verts=[],idx=[];for(let i=0;i<=steps;i++){const t=i/steps,z=6-t*130,inner=5.9+Math.pow(Math.abs(t-.46)*2,1.55)*2.4;for(let j=0;j<levels;j++){const yn=j/(levels-1)*2-1,y=yn*(5.1+.35*Math.sin(t*Math.PI)),x=side*(inner+Math.abs(yn)*1.5+.18*Math.sin(i*.72+j));verts.push(x,y,z);}}for(let i=0;i<steps;i++)for(let j=0;j<levels-1;j++){const a=i*levels+j,b=(i+1)*levels+j;idx.push(a,b,a+1,a+1,b,b+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const mat=new THREE.MeshPhysicalMaterial({color:0x06162f,emissive:0x04152f,emissiveIntensity:.4,metalness:.84,roughness:.28,clearcoat:.8,flatShading:true,transparent:true,opacity:.74,side:THREE.DoubleSide});g.add(new THREE.Mesh(geo,mat));g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,25),line(side<0?C.blue:C.violet,.1)));}for(let i=0;i<12;i++){const t=i/11,z=2-t*120,r=5.35+Math.pow(Math.abs(t-.46)*2,1.35)*1.85;const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.015,5,90),glow(i%4===0?C.violet:C.blue,i%4===0?.18:.07));ring.rotation.x=Math.PI/2;ring.position.z=z;ring.scale.y=.62;g.add(ring);}world.add(g);return g;}
const funnel=funnelWalls();

const starGeo=new THREE.BufferGeometry(),N=mobile()?400:tablet()?700:1100,arr=new Float32Array(N*3);for(let i=0;i<N;i++){arr[i*3]=(Math.random()-.5)*24;arr[i*3+1]=(Math.random()-.5)*15;arr[i*3+2]=8-Math.random()*145;}starGeo.setAttribute('position',new THREE.BufferAttribute(arr,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x70dfff,size:mobile()?.018:.028,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(stars);

const Z=[0,-16,-32,-48,-64,-80,-96,-112,-128],groups=[];
function stage(i,color=C.blue){const g=new THREE.Group();g.position.z=Z[i];const key=new THREE.PointLight(color,1.2,18,2);key.position.set(i%2?4:-4,4,4);g.add(key);const spot=new THREE.SpotLight(color,0,26,Math.PI/7,.5,1.4);spot.position.set(i%2?5:-5,6,5);spot.target.position.set(0,0,0);g.add(spot,spot.target);g.userData={key,spot};groups.push(g);world.add(g);return g;}
function nodes(g,count=9,r=3.8){for(let i=0;i<count;i++){const a=i/count*Math.PI*2,n=new THREE.Mesh(new THREE.IcosahedronGeometry(.17+(i%3)*.035,1),metal(i%3===0?C.violet:C.blue,0x06245a,1));n.position.set(Math.cos(a)*r,Math.sin(a)*2.1,Math.sin(a)*.45);g.add(n);if(i)g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),n.position.clone()]),line(C.cyan,.18)));}}
function panel(w=2.1,h=1.1){const g=new THREE.Group(),p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x071a39,transparent:true,opacity:.5,side:THREE.DoubleSide}));g.add(p);const pts=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2],[-w/2,-h/2]].map(v=>new THREE.Vector3(v[0],v[1],.01));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),line(C.cyan,.4)));return g;}

function build(){let g=stage(0);g.add(sphere(3));const l0=logo(3);l0.position.z=.58;g.add(l0);orbit(g,4.2,.26,C.cyan,.32);orbit(g,4.65,-.16,C.violet,.16);platform(g);
g=stage(1,C.cyan);g.add(sphere(2.5));const l1=logo(2.2);l1.position.z=.5;g.add(l1);nodes(g,10,4.05);orbit(g,4.3,.18,C.cyan,.34);platform(g,-2.9,3.2);
g=stage(2,C.cyan);for(let i=0;i<32;i++){const t=i/31,n=new THREE.Mesh(new THREE.SphereGeometry(.05+(1-t)*.03,8,8),new THREE.MeshBasicMaterial({color:i%5===0?C.violet:C.cyan}));n.position.set((Math.random()-.5)*4.5*(1-t),2-t*3.1,-1.3-t*3.3);g.add(n);}platform(g,-2.85,3.15);
g=stage(3,C.cyan);g.add(rupee(2.1));orbit(g,3.8,.2,C.cyan,.28);orbit(g,4.2,-.15,C.violet,.17);platform(g,-3,3.35);
g=stage(4,C.blue);g.add(rupee(1.35));nodes(g,11,3.6);orbit(g,3.2,.15,C.cyan,.2);platform(g,-2.9,3.0);
g=stage(5,C.violet);const core=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.7,1.7,2,2,2),metal(0x0b2557,0x06245c,.8));core.rotation.set(.5,.65,.12);g.add(core);nodes(g,7,3.6);platform(g,-3,3.15);
g=stage(6,C.violet);const rv=rupee(1.25);rv.position.x=2.35;g.add(rv);for(let i=0;i<8;i++){const h=.5+i*.34,b=new THREE.Mesh(new THREE.BoxGeometry(.32,h,.32),metal(i<5?C.blue:C.violet,0x06255e,1));b.position.set(-3.7+i*.56,-2.1+h/2,-.4+i*.04);g.add(b);}const pts=[];for(let i=0;i<9;i++)pts.push(new THREE.Vector3(-3.6+i*.54,-1.5+i*.3+Math.sin(i*.7)*.18,0));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),line(C.cyan,.58)));platform(g,-3,3.2);
g=stage(7,C.cyan);for(let i=0;i<5;i++){const p=panel();const a=i/5*Math.PI*2;p.position.set(Math.cos(a)*3.5,Math.sin(a)*1.9,Math.sin(a)*.5);p.rotation.y=-a+.25;g.add(p);}g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,2),metal(C.blue,0x07367d,1)));orbit(g,3.6,.18,C.cyan,.22);platform(g,-3,3.0);
g=stage(8,C.blue);g.add(sphere(3));const l8=logo(3);l8.position.z=.58;g.add(l8);orbit(g,4.15,.24,C.cyan,.32);orbit(g,4.6,-.15,C.violet,.16);platform(g);}
build();

const cameraPath=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.1,10),new THREE.Vector3(-.3,.08,-6),new THREE.Vector3(.45,-.08,-22),new THREE.Vector3(-.5,.1,-38),new THREE.Vector3(.48,-.12,-54),new THREE.Vector3(-.32,.08,-70),new THREE.Vector3(.48,-.05,-86),new THREE.Vector3(-.35,.08,-102),new THREE.Vector3(.2,0,-118)],false,'catmullrom',.42);
const lookPath=new THREE.CatmullRomCurve3(Z.map((z,i)=>new THREE.Vector3(i%2?.08:-.08,0,z-1.1)),false,'catmullrom',.42);
let centers=[];function measure(){centers=sections.map(s=>s.offsetTop+s.offsetHeight/2);renderer.setPixelRatio(dpr());renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=mobile()?58:tablet()?52:45;camera.updateProjectionMatrix();composer.setSize(innerWidth,innerHeight);}addEventListener('resize',measure,{passive:true});measure();
function scrollP(){return THREE.MathUtils.clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1);}function activeIdx(){const y=scrollY+innerHeight*.5;let best=0,d=Infinity;centers.forEach((c,i)=>{const x=Math.abs(c-y);if(x<d){d=x;best=i;}});return best;}
const mouse=new THREE.Vector2();addEventListener('pointermove',e=>{mouse.set((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);},{passive:true});
const clock=new THREE.Clock();let cp=new THREE.Vector3(0,0,10),lp=new THREE.Vector3(0,0,-1);
function dom(p,i){sections.forEach((s,k)=>s.classList.toggle('active',k===i));const a=1-THREE.MathUtils.smoothstep(p,.04,.16),b=THREE.MathUtils.smoothstep(p,.84,.98),op=Math.max(a,b);overlay.style.opacity=op.toFixed(3);overlay.style.transform=`translate(-50%,-50%) scale(${.96+op*.04}) rotate(${(p-.5)*1.2}deg)`;const ls=[...document.querySelectorAll('.journey-label span')];ls.forEach((x,k)=>x.classList.toggle('hot',i===k+1||i===Math.min(k+2,6)));}
function loop(){const dt=Math.min(clock.getDelta(),.05),p=reduced?Math.round(scrollP()*8)/8:scrollP(),pos=cameraPath.getPointAt(p),look=lookPath.getPointAt(p);if(!mobile()){pos.x+=mouse.x*(tablet()?.12:.22);pos.y-=mouse.y*(tablet()?.06:.1);}cp.lerp(pos,1-Math.pow(.0008,dt));lp.lerp(look,1-Math.pow(.0012,dt));camera.position.copy(cp);camera.lookAt(lp);const idx=activeIdx();dom(p,idx);groups.forEach((g,i)=>{const d=Math.abs(g.position.z-camera.position.z),f=THREE.MathUtils.clamp(1-d/18,0,1);g.scale.setScalar(.96+f*.06);g.rotation.y=Math.sin(clock.elapsedTime*.13+i)*.01;g.userData.key.intensity=.35+f*3.2;g.userData.spot.intensity=f*5.5;});funnel.rotation.z=Math.sin(clock.elapsedTime*.07)*.004;stars.rotation.z=clock.elapsedTime*.0012;composer.render();requestAnimationFrame(loop);}loop();
