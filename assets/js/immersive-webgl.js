import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.querySelector("#webgl");
const sections = [...document.querySelectorAll(".scene")];
const menuBtn = document.querySelector(".menu");
const mobileMenu = document.querySelector(".mobile-menu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
  mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:"high-performance"});
} catch (e) {
  document.documentElement.classList.add("no-webgl");
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.25 : innerWidth < 1000 ? 1.5 : 1.8));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050b);
scene.fog = new THREE.FogExp2(0x02060e, innerWidth < 700 ? 0.023 : 0.017);
const camera = new THREE.PerspectiveCamera(innerWidth < 700 ? 56 : 48, innerWidth/innerHeight, .1, 300);
camera.position.set(0,0,9);
const world = new THREE.Group(); scene.add(world);
const ambient = new THREE.AmbientLight(0x416aa8, .36); scene.add(ambient);
const cameraLight = new THREE.PointLight(0x73d8ff, 7, 26, 2); cameraLight.position.set(0,2,3); camera.add(cameraLight); scene.add(camera);

const blue = 0x2f80ed, cyan = 0x6bdfff, violet = 0x7357ff;
function matStandard(color=blue, emissive=0x0c3b88, emissiveIntensity=.9, metalness=.82, roughness=.22){
  return new THREE.MeshStandardMaterial({color, emissive, emissiveIntensity, metalness, roughness});
}
function glowMaterial(color=cyan, opacity=.7){
  return new THREE.MeshBasicMaterial({color, transparent:true, opacity, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
}
function lineMaterial(color=cyan, opacity=.45){
  return new THREE.LineBasicMaterial({color, transparent:true, opacity, blending:THREE.AdditiveBlending, depthWrite:false});
}
function makeGlowSprite(color="rgb(47,128,237)", scale=4){
  const c=document.createElement("canvas"); c.width=c.height=128;
  const g=c.getContext("2d"); const grad=g.createRadialGradient(64,64,0,64,64,64);
  grad.addColorStop(0,"rgba(255,255,255,.92)"); grad.addColorStop(.15,color);
  grad.addColorStop(.45,color.replace(")",",.28)").replace("rgb","rgba")); grad.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=grad; g.fillRect(0,0,128,128);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  sp.scale.set(scale,scale,1); return sp;
}

const textureLoader = new THREE.TextureLoader();
const markTexture = textureLoader.load("assets/images/scaleops-mark-exact.png?v=webgl5");
markTexture.colorSpace = THREE.SRGBColorSpace;
function makeLogoPlane(scale=4){
  const aspect = 661/433;
  const geo = new THREE.PlaneGeometry(scale*aspect, scale);
  const mat = new THREE.MeshBasicMaterial({map:markTexture,transparent:true,alphaTest:.02,depthWrite:false,toneMapped:false});
  const m = new THREE.Mesh(geo,mat); m.renderOrder=6; return m;
}
function makeGlassSphere(radius=3.1){
  const g=new THREE.Group();
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(radius,64,48),new THREE.MeshPhysicalMaterial({color:0x061b40,metalness:.05,roughness:.08,transmission:.25,transparent:true,opacity:.34,clearcoat:1,clearcoatRoughness:.08,ior:1.28,thickness:.8,emissive:0x031a40,emissiveIntensity:.7,side:THREE.DoubleSide}));
  g.add(sphere);
  const rim=new THREE.Mesh(new THREE.SphereGeometry(radius*1.012,48,36),new THREE.MeshBasicMaterial({color:0x4bbdff,wireframe:true,transparent:true,opacity:.055,depthWrite:false})); g.add(rim);
  const halo=makeGlowSprite("rgb(47,128,237)",radius*3.4); halo.position.z=-.5; g.add(halo); return g;
}
function addOrbit(group,radius=4.4,tilt=.35,color=cyan,opacity=.46){
  const pts=[]; for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius*.28,0));}
  const geo=new THREE.BufferGeometry().setFromPoints(pts); const l=new THREE.Line(geo,lineMaterial(color,opacity)); l.rotation.x=tilt;l.rotation.z=tilt*.7;group.add(l); return l;
}
function addPlatform(group,y=-3.45,r=4){
  for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r-i*.55,.025,8,100),glowMaterial(i%2?violet:cyan,.52-i*.07));ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.y=.62;group.add(ring);}
  const glow=makeGlowSprite("rgb(47,128,237)",6.8);glow.position.y=y+.15;glow.scale.y=1.5;group.add(glow);
}
function makeStage(z,type){const g=new THREE.Group();g.position.z=z;g.userData.type=type;world.add(g);const light=new THREE.PointLight(type==="rupee"?0x6ae6ff:0x4d8fff,2.8,18,2);light.position.set(0,2,2);g.add(light);g.userData.light=light;return g;}
const Z=[0,-15,-30,-45,-60,-75,-90,-105,-120,-135]; const groups=[];

function heroStage(){
  const g=makeStage(Z[0],"logo");groups.push(g);const orb=makeGlassSphere(3.05);g.add(orb);const logo=makeLogoPlane(3.2);logo.position.z=.6;g.add(logo);addOrbit(g,4.35,.42,cyan,.45);addOrbit(g,4.8,-.23,violet,.28);addPlatform(g);
  for(let i=0;i<8;i++){const cube=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),matStandard(i%2?violet:blue,0x041942,.6,.7,.2));const a=i/8*Math.PI*2;cube.position.set(Math.cos(a)*(4.4+Math.random()),Math.sin(a)*2.2,Math.sin(a)*.8);cube.rotation.set(a*.4,a,.2);g.add(cube);}
}
function orbitStage(){
  const g=makeStage(Z[1],"orbit");groups.push(g);const orb=makeGlassSphere(2.65);g.add(orb);const logo=makeLogoPlane(2.7);logo.position.z=.55;g.add(logo);addPlatform(g,-3.1,3.6);
  [0,1,2,3,4].forEach(i=>{const a=i/5*Math.PI*2;const node=new THREE.Mesh(new THREE.IcosahedronGeometry(.43,2),new THREE.MeshPhysicalMaterial({color:i===2?violet:blue,emissive:i===2?0x3b136f:0x073c8c,emissiveIntensity:1.8,metalness:.62,roughness:.16,clearcoat:1}));node.position.set(Math.cos(a)*4.45,Math.sin(a)*2.35,Math.sin(a)*.7);g.add(node);const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),node.position.clone()]);g.add(new THREE.Line(geo,lineMaterial(0x4fc8ff,.32)));}); addOrbit(g,4.5,.26,cyan,.5);
}
function makeRupee(){
  const g=new THREE.Group();const material=matStandard(0x52baff,0x0c55ba,2.3,.88,.12);
  const make=(sx,sy,sz,x,y,r=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz,6,2,2),material);m.position.set(x,y,0);m.rotation.z=r;g.add(m);return m};
  make(3.2,.34,.65,0,1.45);make(3.0,.3,.65,-.12,.84);make(.42,1.25,.65,-1.1,.75,-.22);make(2.3,.38,.65,-.15,.18,-.23);make(2.55,.42,.65,.25,-.75,-.72);g.rotation.y=-.18;g.rotation.x=.07;const glow=makeGlowSprite("rgb(82,186,255)",6);glow.position.z=-.8;g.add(glow);return g;
}
function rupeeStage(){
  const g=makeStage(Z[2],"rupee");groups.push(g);const orb=makeGlassSphere(2.75);g.add(orb);const r=makeRupee();r.scale.set(1.15,1.15,1.15);r.position.z=.55;g.add(r);addPlatform(g,-3.2,3.8);for(let i=0;i<3;i++)addOrbit(g,4.1+i*.45,.2+i*.16,i===1?violet:cyan,.24+i*.08);
  for(let i=0;i<10;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:i%3?cyan:violet}));p.position.set(-6+i*.55,Math.sin(i)*.35,0);g.add(p);}
}
function createFunnelSegment(zCenter,length=88){
  const g=new THREE.Group();g.position.z=zCenter;const geo=new THREE.CylinderGeometry(2.1,7.0,length,64,12,true);geo.rotateX(Math.PI/2);
  const wall=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0x061a45,emissive:0x073a86,emissiveIntensity:.55,metalness:.3,roughness:.24,transparent:true,opacity:.13,side:THREE.DoubleSide,wireframe:false}));g.add(wall);
  const wire=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x2189ff,wireframe:true,transparent:true,opacity:.075,depthWrite:false}));g.add(wire);
  for(let i=0;i<13;i++){const t=i/12;const radius=THREE.MathUtils.lerp(2.0,6.8,t);const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.018,6,100),glowMaterial(i%4===0?violet:blue,i%4===0?.35:.18));ring.scale.y=.62;ring.position.z=THREE.MathUtils.lerp(length/2,-length/2,t);g.add(ring);}world.add(g);return g;
}
const tunnel=createFunnelSegment(-65,88);
function funnelStage(){const g=makeStage(Z[3],"funnel");groups.push(g);const r=makeRupee();r.scale.set(1.32,1.32,1.32);g.add(r);addPlatform(g,-3.1,3.3);for(let i=0;i<10;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.28,.4+i*.14,.28),matStandard(i%3===0?violet:blue,0x052a70,1.2,.7,.2));bar.position.set(-3.1+i*.68,-2.45+(i*.14)/2,-1.2);g.add(bar);}}
function systemsStage(){const g=makeStage(Z[4],"systems");groups.push(g);const r=makeRupee();r.scale.set(.72,.72,.72);g.add(r);const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,2),new THREE.MeshPhysicalMaterial({color:0x071b44,emissive:0x073f96,emissiveIntensity:1.05,metalness:.55,roughness:.16,transparent:true,opacity:.58,clearcoat:1}));g.add(core);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const node=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.7),matStandard(i%2?violet:blue,0x082a6c,1.35,.72,.14));node.position.set(Math.cos(a)*4.0,Math.sin(a)*2.35,0);node.rotation.set(.4,a,.35);g.add(node);const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),node.position.clone()]);g.add(new THREE.Line(geo,lineMaterial(0x55cfff,.4)));}addPlatform(g,-3.1,3.6);}
function servicesStage(){const g=makeStage(Z[5],"services");groups.push(g);const center=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.3,2.3,3,3,3),new THREE.MeshPhysicalMaterial({color:0x08235a,emissive:0x062b70,emissiveIntensity:1.1,metalness:.64,roughness:.18,transparent:true,opacity:.76,clearcoat:1}));center.rotation.set(.5,.6,.15);g.add(center);const logo=makeLogoPlane(1.5);logo.position.z=1.35;g.add(logo);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const panel=new THREE.Mesh(new THREE.BoxGeometry(1.1,.74,.22),matStandard(i%2?violet:blue,0x07265c,.9,.72,.2));panel.position.set(Math.cos(a)*4.2,Math.sin(a)*2.25,Math.sin(a)*.5);panel.rotation.z=a+.35;g.add(panel);}addOrbit(g,4.6,.22,cyan,.35);addPlatform(g,-3.2,3.6);}
function proofStage(){const g=makeStage(Z[6],"proof");groups.push(g);const baseY=-2.5;const heights=[.7,1.1,1.55,2.1,2.8,3.6];heights.forEach((h,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.55,h,.55),matStandard(i>3?violet:blue,0x083887,1.5,.66,.18));m.position.set(-2.3+i*.9,baseY+h/2,0);g.add(m);});const pts=heights.map((h,i)=>new THREE.Vector3(-2.3+i*.9,baseY+h+.35,.2));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMaterial(0x7be8ff,.92)));for(const p of pts){const s=new THREE.Mesh(new THREE.SphereGeometry(.08,10,10),new THREE.MeshBasicMaterial({color:0xc2f7ff}));s.position.copy(p);g.add(s)}const r=makeRupee();r.scale.set(.48,.48,.48);r.position.set(0,1.8,-1);g.add(r);addPlatform(g,-3.25,3.8);}
function insightsStage(){const g=makeStage(Z[7],"insights");groups.push(g);for(let i=0;i<5;i++){const slab=new THREE.Mesh(new THREE.BoxGeometry(2.25,1.32,.16),matStandard(i%2?violet:blue,0x062a68,.7,.58,.26));slab.position.set((i-2)*1.3,(i%2?1:-.35),i*.26);slab.rotation.set(-.08,(i-2)*.1,(i-2)*.04);g.add(slab);for(let j=0;j<3;j++){const line=new THREE.Mesh(new THREE.BoxGeometry(1.3-j*.15,.035,.02),glowMaterial(j===0?cyan:blue,.5));line.position.set(slab.position.x,slab.position.y+.26-j*.22,slab.position.z+.11);line.rotation.copy(slab.rotation);g.add(line);}}addPlatform(g,-3.15,3.7);}
function returnStage(){const g=makeStage(Z[8],"return");groups.push(g);const orb=makeGlassSphere(2.55);g.add(orb);const logo=makeLogoPlane(2.65);logo.position.z=.55;g.add(logo);addOrbit(g,4.2,.24,cyan,.38);addOrbit(g,4.6,-.18,violet,.24);addPlatform(g,-3.0,3.55);}
function finalStage(){const g=makeStage(Z[9],"final");groups.push(g);const logo=makeLogoPlane(4.15);logo.position.z=.2;g.add(logo);addPlatform(g,-3.05,4);const glow=makeGlowSprite("rgb(47,128,237)",8);glow.position.z=-1;g.add(glow);}
heroStage();orbitStage();rupeeStage();funnelStage();systemsStage();servicesStage();proofStage();insightsStage();returnStage();finalStage();

const starCount=innerWidth<700?450:innerWidth<1000?850:1400;const starPos=new Float32Array(starCount*3);for(let i=0;i<starCount;i++){starPos[i*3]=(Math.random()-.5)*30;starPos[i*3+1]=(Math.random()-.5)*18;starPos[i*3+2]=-Math.random()*155+8;}const stars=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0x78cbff,size:innerWidth<700?.03:.045,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false}));stars.geometry.setAttribute("position",new THREE.BufferAttribute(starPos,3));world.add(stars);
for(let i=0;i<Z.length;i++){const l=new THREE.PointLight(i%3===0?0x7555ff:0x2f80ed,1.4,15,2);l.position.set(i%2?-5:5,(i%3-1)*2,Z[i]);world.add(l);}
const mouse={x:0,y:0};addEventListener("pointermove",e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
let sectionCenters=[];function measure(){sectionCenters=sections.map(s=>s.offsetTop+s.offsetHeight/2);renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.25:innerWidth<1000?1.5:1.8));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?56:innerWidth<1000?52:48;camera.updateProjectionMatrix();}addEventListener("resize",measure,{passive:true});measure();
function scrollState(){const y=scrollY+innerHeight*.5;let a=0;for(let i=0;i<sectionCenters.length-1;i++){if(y>=sectionCenters[i])a=i;}const b=Math.min(a+1,sectionCenters.length-1);const denom=Math.max(1,sectionCenters[b]-sectionCenters[a]);const t=b===a?0:THREE.MathUtils.clamp((y-sectionCenters[a])/denom,0,1);return {a,b,t,virtual:a+t};}
function smoothstep(t){return t*t*(3-2*t)}function clamp01(x){return Math.max(0,Math.min(1,x))}function updateActive(index){sections.forEach((s,i)=>s.classList.toggle("active",i===index));document.body.dataset.scene=sections[index]?.dataset.scene||"logo";}
let currentZ=9,currentX=0,currentY=0,lastActive=-1;const clock=new THREE.Clock();function animate(){const dt=Math.min(clock.getDelta(),.05);const time=clock.elapsedTime;const st=scrollState();const t=smoothstep(st.t);const targetZ=THREE.MathUtils.lerp(Z[st.a]+9,Z[st.b]+9,t);currentZ=THREE.MathUtils.lerp(currentZ,targetZ,1-Math.pow(.001,dt));const parallaxX=mouse.x*(innerWidth<700?.12:.34);const parallaxY=-mouse.y*(innerWidth<700?.08:.2);currentX=THREE.MathUtils.lerp(currentX,parallaxX,.045);currentY=THREE.MathUtils.lerp(currentY,parallaxY,.045);camera.position.set(currentX,currentY,currentZ);camera.lookAt(currentX*.22,currentY*.18,currentZ-9);const nearest=Math.round(st.virtual);if(nearest!==lastActive){lastActive=nearest;updateActive(nearest)}groups.forEach((g,i)=>{const d=Math.abs((Z[i]+9)-currentZ);const focus=clamp01(1-d/19);const s=.92+focus*.11;g.scale.lerp(new THREE.Vector3(s,s,s),.08);if(g.userData.light)g.userData.light.intensity=.6+focus*6.4;g.rotation.y=Math.sin(time*.18+i)*.018+mouse.x*.014;g.rotation.x=Math.cos(time*.15+i)*.008;});const mid=1-Math.min(1,Math.abs(st.virtual-4.5)/4.0);tunnel.rotation.z=Math.sin(time*.12)*.025;tunnel.children.forEach(c=>{if(c.material&&"opacity" in c.material&&c.material.transparent){const base=c.material.wireframe?.055:.1;c.material.opacity=base+mid*(c.material.wireframe?.06:.07);}});stars.rotation.z=time*.0025;renderer.render(scene,camera);requestAnimationFrame(animate);}animate();