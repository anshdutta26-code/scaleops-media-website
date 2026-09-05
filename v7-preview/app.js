import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas=document.querySelector('#webgl');
const scenes=[...document.querySelectorAll('.scene')];
const overlay=document.querySelector('#logo-overlay');
const menu=document.querySelector('.menu');
const mobileMenu=document.querySelector('.mobile-menu');
if(menu&&mobileMenu){menu.addEventListener('click',()=>mobileMenu.classList.toggle('open'));mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')))}

const mobile=()=>innerWidth<700, tablet=()=>innerWidth>=700&&innerWidth<1050;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){document.documentElement.classList.add('no-webgl');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile()?1.2:tablet()?1.5:2));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=!mobile();
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x01040a);
scene.fog=new THREE.FogExp2(0x020711,mobile()?.019:.0125);
const camera=new THREE.PerspectiveCamera(mobile()?58:tablet()?52:45,innerWidth/innerHeight,.1,260);
scene.add(camera);
const world=new THREE.Group();scene.add(world);

const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),mobile()?.42:.72,.65,.22);composer.addPass(bloom);composer.addPass(new OutputPass());

const C={blue:0x2f80ed,cyan:0x69dfff,violet:0x7657ff,navy:0x07142d,deep:0x020711,green:0x36f1a0,white:0xf8fbff};
scene.add(new THREE.HemisphereLight(0x315c94,0x010307,.55));
const rim=new THREE.DirectionalLight(0x63dfff,1.8);rim.position.set(-6,7,6);scene.add(rim);
const fill=new THREE.DirectionalLight(0x7657ff,1.15);fill.position.set(7,-2,2);scene.add(fill);

const texLoader=new THREE.TextureLoader();
let markTex=null;
texLoader.load('assets/scaleops-mark.png?v=v7',t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());markTex=t;},undefined,()=>document.documentElement.classList.add('texture-fallback'));

const lineMat=(color=C.cyan,opacity=.28)=>new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
const glowMat=(color=C.cyan,opacity=.4)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const metal=(color=C.blue,em=0x082f75,ei=.85)=>new THREE.MeshPhysicalMaterial({color,emissive:em,emissiveIntensity:ei,metalness:.88,roughness:.18,clearcoat:1,clearcoatRoughness:.08});
const darkMetal=()=>new THREE.MeshPhysicalMaterial({color:0x06162f,emissive:0x04152f,emissiveIntensity:.4,metalness:.82,roughness:.28,clearcoat:.8,flatShading:true,transparent:true,opacity:.82,side:THREE.DoubleSide});

function spriteGlow(hex=0x2f80ed,scale=4,opacity=.7){const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d');const g=x.createRadialGradient(96,96,0,96,96,96);const h='#'+hex.toString(16).padStart(6,'0');g.addColorStop(0,'rgba(255,255,255,.96)');g.addColorStop(.08,h);g.addColorStop(.35,h+'55');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,192,192);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(scale,scale,1);return s;}
function logoPlane(scale=3){const g=new THREE.Group();const aspect=661/433;const geo=new THREE.PlaneGeometry(scale*aspect,scale);for(let i=0;i<5;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,opacity:.1+i*.08,depthWrite:false,toneMapped:false,color:i<2?0x174fbf:0x2f80ed}));m.position.set(-i*.012,i*.006,-.22+i*.04);g.add(m)}const front=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,depthWrite:false,toneMapped:false}));front.position.z=.04;front.renderOrder=8;g.add(front);const halo=spriteGlow(C.blue,scale*2.15,.55);halo.position.z=-.6;g.add(halo);return g;}
function glassSphere(r=3){return new THREE.Mesh(new THREE.SphereGeometry(r,mobile()?36:64,mobile()?24:44),new THREE.MeshPhysicalMaterial({color:0x061832,roughness:.07,metalness:.08,transmission:.28,transparent:true,opacity:.26,clearcoat:1,ior:1.3,thickness:1.1,emissive:0x031a40,emissiveIntensity:.55,side:THREE.DoubleSide}));}
function orbit(group,r=4.2,tilt=.25,color=C.cyan,opacity=.3){const pts=[];for(let i=0;i<=200;i++){const a=i/200*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.27,Math.sin(a*2)*.06));}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat(color,opacity));l.rotation.x=tilt;l.rotation.z=tilt*.5;group.add(l);return l;}
function platform(group,y=-3.1,r=3.6){for(let i=0;i<4;i++){const tor=new THREE.Mesh(new THREE.TorusGeometry(r-i*.55,.018,6,110),glowMat(i%2?C.violet:C.cyan,.42-i*.06));tor.rotation.x=Math.PI/2;tor.position.y=y;tor.scale.y=.6;group.add(tor);}const h=spriteGlow(C.blue,5.6,.42);h.position.y=y+.05;h.scale.y=1.05;group.add(h);}

function rupee(scale=2.4){const s=new THREE.Shape();const p=[[-.82,.88],[.82,.88],[.82,.62],[.22,.62],[.4,.45],[.82,.45],[.82,.18],[.45,.18],[.34,.02],[.06,-.16],[.72,-.9],[.28,-.9],[-.42,-.08],[-.42,.13],[-.02,.18],[-.82,.18],[-.82,.45],[-.04,.45],[-.2,.62],[-.82,.62]];s.moveTo(...p[0]);for(const q of p.slice(1))s.lineTo(...q);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:true,bevelThickness:.055,bevelSize:.045,bevelSegments:5,curveSegments:16});geo.center();const mesh=new THREE.Mesh(geo,metal(C.blue,0x0a3b99,1.15));mesh.scale.setScalar(scale);mesh.castShadow=true;const g=new THREE.Group();g.add(mesh);const halo=spriteGlow(C.cyan,scale*2.2,.52);halo.position.z=-1;g.add(halo);return g;}

function safeFunnel(){const g=new THREE.Group();const steps=30,levels=6;for(const side of [-1,1]){const verts=[],idx=[];for(let i=0;i<=steps;i++){const t=i/steps,z=8-t*132;const throat=5.6+Math.pow(Math.abs(t-.47)*2,1.5)*2.3;for(let j=0;j<levels;j++){const yn=(j/(levels-1))*2-1;const y=yn*(5.2+.4*Math.sin(t*Math.PI));const x=side*(throat+Math.abs(yn)*1.45+.22*Math.sin(i*.72+j));verts.push(x,y,z);}}for(let i=0;i<steps;i++){for(let j=0;j<levels-1;j++){const a=i*levels+j,b=(i+1)*levels+j;idx.push(a,b,a+1,a+1,b,b+1);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const wall=new THREE.Mesh(geo,darkMetal());wall.receiveShadow=true;g.add(wall);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo,25),lineMat(side<0?C.blue:C.violet,.12));g.add(edges);}
for(let i=0;i<14;i++){const t=i/13,z=3-t*124;const r=5.15+Math.pow(Math.abs(t-.47)*2,1.35)*1.9;const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.017,5,96),glowMat(i%4===0?C.violet:C.blue,i%4===0?.2:.08));ring.rotation.x=Math.PI/2;ring.position.z=z;ring.scale.y=.62;g.add(ring);}world.add(g);return g;}
const funnel=safeFunnel();

function starField(){const n=mobile()?450:tablet()?850:1400;const arr=new Float32Array(n*3);for(let i=0;i<n;i++){arr[i*3]=(Math.random()-.5)*26;arr[i*3+1]=(Math.random()-.5)*16;arr[i*3+2]=10-Math.random()*150;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arr,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0x70dfff,size:mobile()?.02:.03,transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(pts);return pts;}
const stars=starField();

const Z=[0,-16,-32,-48,-64,-80,-96,-112,-128];const stages=[];
function stage(i,color=C.blue){const g=new THREE.Group();g.position.z=Z[i];const key=new THREE.PointLight(color,1.4,18,2);key.position.set(i%2?4:-4,4,4);g.add(key);const spot=new THREE.SpotLight(color,0,26,Math.PI/7,.5,1.4);spot.position.set(i%2?5:-5,6,5);spot.target.position.set(0,0,0);g.add(spot,spot.target);g.userData={key,spot,index:i};world.add(g);stages.push(g);return g;}
function addSignalNodes(g,count=9,r=4){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const n=new THREE.Mesh(new THREE.IcosahedronGeometry(.18+(i%3)*.04,1),metal(i%3===0?C.violet:C.blue,0x06245a,1));n.position.set(Math.cos(a)*r,Math.sin(a)*2.15,Math.sin(a)*.5);g.add(n);if(i>0)g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),n.position.clone()]),lineMat(C.cyan,.2)));}}
function holoPanel(w=2.3,h=1.25){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x071a39,transparent:true,opacity:.5,side:THREE.DoubleSide}));g.add(p);const pts=[new THREE.Vector3(-w/2,-h/2,0),new THREE.Vector3(w/2,-h/2,0),new THREE.Vector3(w/2,h/2,0),new THREE.Vector3(-w/2,h/2,0),new THREE.Vector3(-w/2,-h/2,0)];g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat(C.cyan,.42)));return g;}

function build(){
 let g=stage(0,C.blue);g.add(glassSphere(3.05));const l0=logoPlane(3.15);l0.position.z=.6;g.add(l0);orbit(g,4.3,.28,C.cyan,.36);orbit(g,4.75,-.18,C.violet,.18);platform(g);
 g=stage(1,C.cyan);g.add(glassSphere(2.55));const l1=logoPlane(2.3);l1.position.z=.5;g.add(l1);addSignalNodes(g,10,4.2);orbit(g,4.4,.2,C.cyan,.38);platform(g,-2.9,3.25);
 g=stage(2,C.cyan);for(let i=0;i<38;i++){const t=i/37;const n=new THREE.Mesh(new THREE.SphereGeometry(.055+(1-t)*.035,10,10),new THREE.MeshBasicMaterial({color:i%5===0?C.violet:C.cyan}));n.position.set((Math.random()-.5)*4.8*(1-t),2.2-t*3.3,-1.5-t*3.4);g.add(n);}for(let i=0;i<5;i++){const tor=new THREE.Mesh(new THREE.TorusGeometry(3.5-i*.46,.018,6,96),glowMat(i%2?C.violet:C.cyan,.28-i*.03));tor.rotation.x=Math.PI/2;tor.position.y=-2.8;g.add(tor);} 
 g=stage(3,C.cyan);const r3=rupee(2.25);r3.position.z=.25;g.add(r3);orbit(g,3.9,.2,C.cyan,.32);orbit(g,4.35,-.18,C.violet,.2);platform(g,-3,3.45);
 g=stage(4,C.blue);const r4=rupee(1.45);g.add(r4);addSignalNodes(g,11,3.75);for(let i=0;i<3;i++)orbit(g,3.15+i*.5,.1+i*.08,i===1?C.violet:C.cyan,.18+i*.05);platform(g,-2.9,3.05);
 g=stage(5,C.violet);const core=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8,2,2,2),metal(0x0b2557,0x06245c,.8));core.rotation.set(.5,.65,.12);g.add(core);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const n=new THREE.Mesh(new THREE.OctahedronGeometry(.42),metal(i%2?C.violet:C.blue,0x06255e,1));n.position.set(Math.cos(a)*3.7,Math.sin(a)*2.2,Math.sin(a)*.5);g.add(n);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),n.position.clone()]),lineMat(C.cyan,.26)));}platform(g,-3,3.2);
 g=stage(6,C.violet);const r6=rupee(1.35);r6.position.x=2.5;g.add(r6);for(let i=0;i<8;i++){const h=.55+i*.36;const b=new THREE.Mesh(new THREE.BoxGeometry(.34,h,.34),metal(i<5?C.blue:C.violet,0x06255e,1));b.position.set(-3.8+i*.58,-2.25+h/2,-.5+i*.04);g.add(b);}const curvePts=[];for(let i=0;i<9;i++)curvePts.push(new THREE.Vector3(-3.7+i*.55,-1.6+i*.32+Math.sin(i*.8)*.22,0));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curvePts),lineMat(C.cyan,.65)));platform(g,-3,3.25);
 g=stage(7,C.cyan);for(let i=0;i<5;i++){const p=holoPanel(2.1,1.15);const a=i/5*Math.PI*2;p.position.set(Math.cos(a)*3.6,Math.sin(a)*2.0,Math.sin(a)*.6);p.rotation.y=-a+.25;p.rotation.x=Math.sin(a)*.08;g.add(p);}const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,2),metal(C.blue,0x07367d,1));g.add(orb);orbit(g,3.7,.2,C.cyan,.24);platform(g,-3,3.1);
 g=stage(8,C.blue);g.add(glassSphere(3.0));const l8=logoPlane(3.1);l8.position.z=.58;g.add(l8);orbit(g,4.15,.25,C.cyan,.34);orbit(g,4.65,-.17,C.violet,.17);platform(g);
}
build();

const cameraCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,.1,10.5),new THREE.Vector3(-.35,.1,-5.5),new THREE.Vector3(.5,-.1,-21.5),new THREE.Vector3(-.55,.15,-37.5),new THREE.Vector3(.55,-.15,-53.5),new THREE.Vector3(-.35,.12,-69.5),new THREE.Vector3(.55,-.05,-85.5),new THREE.Vector3(-.4,.1,-101.5),new THREE.Vector3(.25,0,-117.5)
],false,'catmullrom',.45);
const targetCurve=new THREE.CatmullRomCurve3(Z.map((z,i)=>new THREE.Vector3((i%2?-.12:.12),0,z-1.2)),false,'catmullrom',.45);

let centers=[];function measure(){centers=scenes.map(s=>s.offsetTop+s.offsetHeight/2);renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile()?1.2:tablet()?1.5:2));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=mobile()?58:tablet()?52:45;camera.updateProjectionMatrix();composer.setSize(innerWidth,innerHeight);}addEventListener('resize',measure,{passive:true});measure();
function progress(){const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);return THREE.MathUtils.clamp(scrollY/total,0,1);}function activeIndex(){const y=scrollY+innerHeight*.5;let best=0,d=Infinity;centers.forEach((c,i)=>{const n=Math.abs(c-y);if(n<d){d=n;best=i;}});return best;}
function updateDOM(p,idx){scenes.forEach((s,i)=>s.classList.toggle('active',i===idx));const finalFade=THREE.MathUtils.smoothstep(p,.82,.985);const heroFade=1-THREE.MathUtils.smoothstep(p,.035,.17);const op=Math.max(heroFade,finalFade);overlay.style.opacity=op.toFixed(3);const sc=heroFade>.5?1-finalFade*.08:.92+finalFade*.08;overlay.style.transform=`translate(-50%,-50%) scale(${sc}) rotate(${(p-.5)*1.6}deg)`;const labels=[...document.querySelectorAll('.journey-label span')];labels.forEach((el,i)=>el.classList.toggle('hot',idx===i+1||idx===Math.min(i+2,6)));}

const mouse=new THREE.Vector2();addEventListener('pointermove',e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
const clock=new THREE.Clock();let camPos=new THREE.Vector3(),look=new THREE.Vector3();
function render(){const dt=Math.min(clock.getDelta(),.05),t=reduceMotion?Math.round(progress()*8)/8:progress();const pos=cameraCurve.getPointAt(t),tar=targetCurve.getPointAt(t);const mx=mobile()?0:mouse.x*(tablet()?.16:.28),my=mobile()?0:-mouse.y*(tablet()?.08:.13);pos.x+=mx;pos.y+=my;camPos.lerp(pos,1-Math.pow(.0008,dt));look.lerp(tar,1-Math.pow(.0013,dt));camera.position.copy(camPos);camera.lookAt(look);const idx=activeIndex();updateDOM(t,idx);stages.forEach((g,i)=>{const dist=Math.abs(g.position.z-camera.position.z);const focus=THREE.MathUtils.clamp(1-dist/19,0,1);g.scale.setScalar(.94+focus*.08);g.rotation.y=Math.sin(clock.elapsedTime*.14+i)*.012;if(g.userData.key)g.userData.key.intensity=.45+focus*3.8;if(g.userData.spot)g.userData.spot.intensity=focus*6.5;});funnel.rotation.z=Math.sin(clock.elapsedTime*.08)*.005;stars.rotation.z=clock.elapsedTime*.0015;composer.render();requestAnimationFrame(render);}render();
