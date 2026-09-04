import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.querySelector("#webgl");
const sections = [...document.querySelectorAll(".scene")];
const menuBtn = document.querySelector(".menu");
const mobileMenu = document.querySelector(".mobile-menu");

document.querySelectorAll(".brand-type,.footer-lockup .brand-type").forEach(el => el.remove());
const brand = document.querySelector(".site-header .brand");
if (brand) { brand.style.minWidth = "64px"; brand.style.width = "64px"; }
document.querySelectorAll(".site-header .brand img,.site-footer img").forEach(img => {
  img.style.width = "58px"; img.style.height = "50px"; img.style.objectFit = "contain";
});

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
  mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:"high-performance"});
} catch (error) {
  document.documentElement.classList.add("no-webgl");
  throw error;
}
const dpr = () => Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.25 : innerWidth < 1000 ? 1.55 : 2);
renderer.setPixelRatio(dpr());
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
renderer.shadowMap.enabled = innerWidth > 900;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050b);
scene.fog = new THREE.FogExp2(0x02060e, innerWidth < 700 ? 0.024 : 0.016);
const camera = new THREE.PerspectiveCamera(innerWidth < 700 ? 57 : innerWidth < 1000 ? 52 : 47, innerWidth/innerHeight, .1, 300);
camera.position.set(0,0,9);
const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.AmbientLight(0x315d9d,.42);
scene.add(ambient);
const cameraLight = new THREE.PointLight(0x8adfff,7.5,28,2);
cameraLight.position.set(0,2,3);
camera.add(cameraLight);
scene.add(camera);

const blue=0x2f80ed, cyan=0x6bdfff, violet=0x7357ff, navy=0x06152f;
const matStandard=(color=blue,emissive=0x0c3b88,emissiveIntensity=.9,metalness=.82,roughness=.2)=>
  new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity,metalness,roughness});
const glowMaterial=(color=cyan,opacity=.65)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const lineMaterial=(color=cyan,opacity=.4)=>new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});

function makeGlowSprite(color="rgb(47,128,237)",scale=4){
  const c=document.createElement("canvas"); c.width=c.height=192;
  const x=c.getContext("2d"), gr=x.createRadialGradient(96,96,0,96,96,96);
  gr.addColorStop(0,"rgba(255,255,255,.96)"); gr.addColorStop(.1,color);
  gr.addColorStop(.42,color.replace(")",",.26)").replace("rgb","rgba")); gr.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=gr; x.fillRect(0,0,192,192);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  sp.scale.set(scale,scale,1); return sp;
}

const textureLoader=new THREE.TextureLoader();
const markTexture=textureLoader.load("assets/images/scaleops-mark-exact.png?v=webgl6");
markTexture.colorSpace=THREE.SRGBColorSpace;
markTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

function makeLogoPlane(scale=4){
  const aspect=661/433;
  const geo=new THREE.PlaneGeometry(scale*aspect,scale);
  const mat=new THREE.MeshBasicMaterial({map:markTexture,transparent:true,alphaTest:.03,depthWrite:false,toneMapped:false});
  const m=new THREE.Mesh(geo,mat); m.renderOrder=7; return m;
}

function makeRupeeTexture(front=true){
  const c=document.createElement("canvas"); c.width=c.height=1024;
  const x=c.getContext("2d");
  x.clearRect(0,0,1024,1024);
  x.textAlign="center"; x.textBaseline="middle";
  x.font='900 700px "Arial Black","Inter","Noto Sans",sans-serif';
  if(front){
    const g=x.createLinearGradient(250,220,800,820);
    g.addColorStop(0,"#d9fbff"); g.addColorStop(.18,"#6fe4ff"); g.addColorStop(.48,"#2f8fff"); g.addColorStop(.72,"#3659e8"); g.addColorStop(1,"#7b4dff");
    x.shadowColor="#2f80ed"; x.shadowBlur=42; x.lineWidth=14; x.strokeStyle="rgba(176,246,255,.85)";
    x.strokeText("₹",512,525); x.fillStyle=g; x.fillText("₹",512,525);
  }else{
    x.fillStyle="#071b62"; x.fillText("₹",512,525);
  }
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return tex;
}
const rupeeFront=makeRupeeTexture(true), rupeeBack=makeRupeeTexture(false);

function makeRupee(scale=3.8){
  const g=new THREE.Group();
  const geo=new THREE.PlaneGeometry(scale,scale);
  for(let i=0;i<8;i++){
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:rupeeBack,transparent:true,alphaTest:.02,depthWrite:i===0,toneMapped:false,color:0x2557c8}));
    m.position.z=-.38+i*.045; m.position.x=-i*.018; m.position.y=i*.008; g.add(m);
  }
  const front=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:rupeeFront,transparent:true,alphaTest:.02,depthWrite:false,toneMapped:false}));
  front.position.z=.02; front.renderOrder=8; g.add(front);
  const halo=makeGlowSprite("rgb(55,143,255)",scale*1.75); halo.position.z=-.8; g.add(halo);
  g.rotation.y=-.13; g.rotation.x=.04;
  return g;
}

function makeGlassSphere(radius=3){
  const g=new THREE.Group();
  const shell=new THREE.Mesh(new THREE.SphereGeometry(radius,innerWidth<700?40:64,innerWidth<700?28:48),
    new THREE.MeshPhysicalMaterial({color:0x061b40,metalness:.08,roughness:.07,transmission:.32,transparent:true,opacity:.31,clearcoat:1,clearcoatRoughness:.05,ior:1.3,thickness:1.1,emissive:0x031a40,emissiveIntensity:.75,side:THREE.DoubleSide}));
  g.add(shell);
  const rim=new THREE.Mesh(new THREE.SphereGeometry(radius*1.012,48,36),new THREE.MeshBasicMaterial({color:0x63d8ff,wireframe:true,transparent:true,opacity:.042,depthWrite:false}));
  g.add(rim);
  const halo=makeGlowSprite("rgb(47,128,237)",radius*3.7); halo.position.z=-.55; g.add(halo);
  return g;
}
function addOrbit(group,r=4.4,tilt=.35,color=cyan,opacity=.42){
  const pts=[]; for(let i=0;i<=180;i++){const a=i/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.28,0));}
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMaterial(color,opacity)); l.rotation.x=tilt;l.rotation.z=tilt*.7;group.add(l);return l;
}
function addPlatform(group,y=-3.35,r=4){
  for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r-i*.55,.022,8,120),glowMaterial(i%2?violet:cyan,.52-i*.07));ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.y=.62;group.add(ring);}
  const halo=makeGlowSprite("rgb(47,128,237)",7);halo.position.y=y+.12;halo.scale.y=1.45;group.add(halo);
}
function makeStage(z,type,color=0x4d8fff){
  const g=new THREE.Group();g.position.z=z;g.userData.type=type;world.add(g);
  const key=new THREE.PointLight(color,3.2,19,2); key.position.set(0,2,2); g.add(key);g.userData.light=key;
  const spot=new THREE.SpotLight(type==="rupee"?0x72eaff:0x4d8fff,0,30,Math.PI/6,.6,1.4);spot.position.set(type==="services"?4:-4,5,4);spot.target.position.set(0,0,0);g.add(spot,spot.target);g.userData.spot=spot;
  return g;
}

const Z=[0,-15,-30,-45,-60,-75,-90,-105,-120,-135], groups=[];

function heroStage(){
  const g=makeStage(Z[0],"logo"); groups.push(g);
  g.add(makeGlassSphere(3.05)); const logo=makeLogoPlane(3.25);logo.position.z=.64;g.add(logo);
  addOrbit(g,4.35,.42,cyan,.48);addOrbit(g,4.8,-.23,violet,.28);addPlatform(g);
  for(let i=0;i<9;i++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.22+i%3*.045,1),matStandard(i%3===0?violet:blue,0x062a75,1.2,.72,.18));const a=i/9*Math.PI*2;c.position.set(Math.cos(a)*(4.5+(i%2)*.7),Math.sin(a)*2.45,Math.sin(a)*.85);c.rotation.set(a*.3,a,.2);g.add(c);}
}
function orbitStage(){
  const g=makeStage(Z[1],"orbit",0x59cfff);groups.push(g);g.add(makeGlassSphere(2.65));const logo=makeLogoPlane(2.7);logo.position.z=.55;g.add(logo);addPlatform(g,-3.1,3.6);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2,node=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,2),matStandard(i===2?violet:blue,0x073c8c,1.8,.62,.14));node.position.set(Math.cos(a)*4.45,Math.sin(a)*2.35,Math.sin(a)*.65);g.add(node);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),node.position.clone()]),lineMaterial(0x62d7ff,.36)));}
  addOrbit(g,4.5,.26,cyan,.55);
}
function rupeeStage(){
  const g=makeStage(Z[2],"rupee",0x75e8ff);groups.push(g);g.add(makeGlassSphere(2.75));const r=makeRupee(3.5);r.position.z=.5;g.add(r);addPlatform(g,-3.2,3.8);
  for(let i=0;i<3;i++)addOrbit(g,4.1+i*.45,.2+i*.16,i===1?violet:cyan,.26+i*.07);
}
function createFunnelSegment(){
  const g=new THREE.Group();g.position.z=-65;
  const geo=new THREE.CylinderGeometry(2.0,7.2,88,72,16,true);geo.rotateX(Math.PI/2);
  const wall=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0x061a45,emissive:0x073a86,emissiveIntensity:.65,metalness:.34,roughness:.2,transparent:true,opacity:.12,side:THREE.DoubleSide}));
  const wire=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x2e92ff,wireframe:true,transparent:true,opacity:.07,depthWrite:false}));
  g.add(wall,wire);
  for(let i=0;i<16;i++){const t=i/15,r=THREE.MathUtils.lerp(2.0,6.9,t),ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,6,120),glowMaterial(i%5===0?violet:blue,i%5===0?.37:.17));ring.scale.y=.62;ring.position.z=THREE.MathUtils.lerp(44,-44,t);g.add(ring);}
  world.add(g);return g;
}
const tunnel=createFunnelSegment();

function funnelStage(){
  const g=makeStage(Z[3],"funnel",0x4ecfff);groups.push(g);const r=makeRupee(3.8);g.add(r);addPlatform(g,-3.1,3.35);
  for(let i=0;i<10;i++){const h=.45+i*.15,bar=new THREE.Mesh(new THREE.BoxGeometry(.3,h,.3),matStandard(i%3===0?violet:blue,0x052a70,1.25,.72,.18));bar.position.set(-3.1+i*.68,-2.45+h/2,-1.2);g.add(bar);}
}
function systemsStage(){
  const g=makeStage(Z[4],"systems",0x62d6ff);groups.push(g);const r=makeRupee(2.25);g.add(r);
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,2),new THREE.MeshPhysicalMaterial({color:navy,emissive:0x073f96,emissiveIntensity:1.1,metalness:.58,roughness:.14,transparent:true,opacity:.55,clearcoat:1}));g.add(core);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,node=new THREE.Mesh(new THREE.BoxGeometry(.72,.72,.72),matStandard(i%2?violet:blue,0x082a6c,1.35,.74,.13));node.position.set(Math.cos(a)*4,Math.sin(a)*2.35,0);node.rotation.set(.4,a,.35);g.add(node);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),node.position.clone()]),lineMaterial(0x64dcff,.44)));}
  addPlatform(g,-3.1,3.6);
}
function servicesStage(){
  const g=makeStage(Z[5],"services",0x7c57ff);groups.push(g);
  const center=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.3,2.3,3,3,3),new THREE.MeshPhysicalMaterial({color:0x08235a,emissive:0x062b70,emissiveIntensity:1.2,metalness:.7,roughness:.14,transparent:true,opacity:.76,clearcoat:1}));center.rotation.set(.5,.6,.15);g.add(center);
  const logo=makeLogoPlane(1.45);logo.position.z=1.35;g.add(logo);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,p=new THREE.Mesh(new THREE.BoxGeometry(1.1,.74,.22),matStandard(i%2?violet:blue,0x07265c,1,.72,.18));p.position.set(Math.cos(a)*4.2,Math.sin(a)*2.25,Math.sin(a)*.5);p.rotation.z=a+.35;g.add(p);}
  addOrbit(g,4.6,.22,cyan,.36);addPlatform(g,-3.2,3.6);
}
function proofStage(){
  const g=makeStage(Z[6],"proof",0x64e0ff);groups.push(g);const base=-2.5,hs=[.7,1.1,1.55,2.1,2.8,3.6];
  hs.forEach((h,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.55,h,.55),matStandard(i>3?violet:blue,0x083887,1.6,.68,.16));m.position.set(-2.3+i*.9,base+h/2,0);g.add(m);});
  const pts=hs.map((h,i)=>new THREE.Vector3(-2.3+i*.9,base+h+.35,.2));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMaterial(0x9af1ff,.95)));
  pts.forEach(p=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.08,12,12),new THREE.MeshBasicMaterial({color:0xe0fbff}));s.position.copy(p);g.add(s);});
  const r=makeRupee(1.55);r.position.set(0,1.8,-1);g.add(r);addPlatform(g,-3.25,3.8);
}
function insightsStage(){
  const g=makeStage(Z[7],"insights",0x7158ff);groups.push(g);
  for(let i=0;i<5;i++){const slab=new THREE.Mesh(new THREE.BoxGeometry(2.25,1.32,.16),matStandard(i%2?violet:blue,0x062a68,.8,.62,.22));slab.position.set((i-2)*1.3,(i%2?1:-.35),i*.26);slab.rotation.set(-.08,(i-2)*.1,(i-2)*.04);g.add(slab);for(let j=0;j<3;j++){const ln=new THREE.Mesh(new THREE.BoxGeometry(1.3-j*.15,.035,.02),glowMaterial(j===0?cyan:blue,.5));ln.position.set(slab.position.x,slab.position.y+.26-j*.22,slab.position.z+.11);ln.rotation.copy(slab.rotation);g.add(ln);}}
  addPlatform(g,-3.15,3.7);
}
function returnStage(){
  const g=makeStage(Z[8],"return",0x62dfff);groups.push(g);g.add(makeGlassSphere(2.55));const logo=makeLogoPlane(2.65);logo.position.z=.55;g.add(logo);addOrbit(g,4.2,.24,cyan,.4);addOrbit(g,4.6,-.18,violet,.25);addPlatform(g,-3,3.55);
}
function finalStage(){
  const g=makeStage(Z[9],"final",0x6bdfff);groups.push(g);const logo=makeLogoPlane(4.15);logo.position.z=.2;g.add(logo);addPlatform(g,-3.05,4);const halo=makeGlowSprite("rgb(47,128,237)",8.4);halo.position.z=-1;g.add(halo);
}
heroStage();orbitStage();rupeeStage();funnelStage();systemsStage();servicesStage();proofStage();insightsStage();returnStage();finalStage();

const starCount=innerWidth<700?500:innerWidth<1000?900:1600;
const starPos=new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){starPos[i*3]=(Math.random()-.5)*30;starPos[i*3+1]=(Math.random()-.5)*18;starPos[i*3+2]=-Math.random()*155+8;}
const stars=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0x78cbff,size:innerWidth<700?.03:.045,transparent:true,opacity:.68,blending:THREE.AdditiveBlending,depthWrite:false}));
stars.geometry.setAttribute("position",new THREE.BufferAttribute(starPos,3));world.add(stars);

const mouse={x:0,y:0};
addEventListener("pointermove",e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
let centers=[];
function measure(){centers=sections.map(s=>s.offsetTop+s.offsetHeight/2);renderer.setPixelRatio(dpr());renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?57:innerWidth<1000?52:47;camera.updateProjectionMatrix();}
addEventListener("resize",measure,{passive:true});measure();

function state(){
  const y=scrollY+innerHeight*.5;let a=0;
  for(let i=0;i<centers.length-1;i++)if(y>=centers[i])a=i;
  const b=Math.min(a+1,centers.length-1),den=Math.max(1,centers[b]-centers[a]);
  return {a,b,t:b===a?0:THREE.MathUtils.clamp((y-centers[a])/den,0,1),virtual:a+(b===a?0:THREE.MathUtils.clamp((y-centers[a])/den,0,1))};
}
const smooth=t=>t*t*(3-2*t),clamp=x=>Math.max(0,Math.min(1,x));
function active(i){sections.forEach((s,k)=>s.classList.toggle("active",k===i));document.body.dataset.scene=sections[i]?.dataset.scene||"logo";}

let currentZ=9,currentX=0,currentY=0,last=-1;
const clock=new THREE.Clock(),tempScale=new THREE.Vector3();
function animate(){
  const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime,st=state(),t=smooth(st.t),targetZ=THREE.MathUtils.lerp(Z[st.a]+9,Z[st.b]+9,t);
  currentZ=THREE.MathUtils.lerp(currentZ,targetZ,1-Math.pow(.001,dt));
  const px=mouse.x*(innerWidth<700?.08:innerWidth<1000?.18:.3),py=-mouse.y*(innerWidth<700?.05:.16);
  currentX=THREE.MathUtils.lerp(currentX,px,.045);currentY=THREE.MathUtils.lerp(currentY,py,.045);
  camera.position.set(currentX,currentY,currentZ);camera.lookAt(currentX*.18,currentY*.16,currentZ-9);
  const nearest=Math.round(st.virtual);if(nearest!==last){last=nearest;active(nearest);}
  groups.forEach((g,i)=>{const d=Math.abs((Z[i]+9)-currentZ),focus=clamp(1-d/19),sc=.92+focus*.115;tempScale.set(sc,sc,sc);g.scale.lerp(tempScale,.08);if(g.userData.light)g.userData.light.intensity=.55+focus*7;if(g.userData.spot)g.userData.spot.intensity=focus*8.5;g.rotation.y=Math.sin(time*.16+i)*.016+mouse.x*.011;g.rotation.x=Math.cos(time*.13+i)*.007;});
  const mid=1-Math.min(1,Math.abs(st.virtual-4.5)/4);tunnel.rotation.z=Math.sin(time*.1)*.022;tunnel.children.forEach(c=>{if(c.material?.transparent){const base=c.material.wireframe?.05:.09;c.material.opacity=base+mid*(c.material.wireframe?.055:.065);}});
  stars.rotation.z=time*.0022;renderer.render(scene,camera);requestAnimationFrame(animate);
}
animate();