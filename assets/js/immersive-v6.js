import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas=document.querySelector('#webgl');
const sections=[...document.querySelectorAll('.scene')];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=()=>innerWidth<700;
const isTablet=()=>innerWidth>=700&&innerWidth<1050;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile()?1.25:isTablet()?1.55:2));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=!isMobile();
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x01040a);
scene.fog=new THREE.FogExp2(0x020712,isMobile()?.021:.0135);
const camera=new THREE.PerspectiveCamera(isMobile()?56:isTablet()?50:44,innerWidth/innerHeight,.1,320);
scene.add(camera);
const world=new THREE.Group();scene.add(world);

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),isMobile()?.55:.9,.72,.2);
composer.addPass(bloom);composer.addPass(new OutputPass());

const C={blue:0x2f80ed,cyan:0x69dfff,violet:0x7457ff,navy:0x06142d,deep:0x020711,white:0xf8fbff,green:0x36f1a0};
scene.add(new THREE.HemisphereLight(0x294f88,0x02040a,.5));
const camLight=new THREE.PointLight(0xaeefff,6.5,24,2);camLight.position.set(0,2.5,4);camera.add(camLight);

const texLoader=new THREE.TextureLoader();
const markTex=texLoader.load('assets/images/scaleops-mark-master.png?v=v6-20260905');
markTex.colorSpace=THREE.SRGBColorSpace;markTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

function glowSprite(hex=0x2f80ed,scale=3,opacity=.75){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const r=x.createRadialGradient(128,128,0,128,128,128);const color='#'+hex.toString(16).padStart(6,'0');r.addColorStop(0,'rgba(255,255,255,.98)');r.addColorStop(.08,color);r.addColorStop(.35,color+'66');r.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=r;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(scale,scale,1);return s}
const metallic=(color=C.blue,emissive=0x082c72,ei=1)=>new THREE.MeshPhysicalMaterial({color,emissive,emissiveIntensity:ei,metalness:.88,roughness:.16,clearcoat:1,clearcoatRoughness:.08});
const glass=()=>new THREE.MeshPhysicalMaterial({color:0x071d42,metalness:.08,roughness:.06,transmission:.3,transparent:true,opacity:.34,clearcoat:1,ior:1.32,thickness:1.2,side:THREE.DoubleSide});
const lineMat=(color=C.cyan,opacity=.42)=>new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});

function makeLogo3D(scale=3.1){const g=new THREE.Group();const aspect=661/433;const geo=new THREE.PlaneGeometry(scale*aspect,scale);for(let i=0;i<7;i++){const side=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,alphaTest:.035,toneMapped:false,color:i<2?0x0f3188:0x153eb8,opacity:.2+.08*i,depthWrite:false}));side.position.z=-.32+i*.045;side.position.x=-.012*i;side.position.y=.008*i;g.add(side)}const front=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:markTex,transparent:true,alphaTest:.025,toneMapped:false,depthWrite:false}));front.position.z=.04;front.renderOrder=8;g.add(front);const halo=glowSprite(C.blue,scale*2.25,.62);halo.position.z=-.7;g.add(halo);return g}

function makeRupee(scale=2.8){const shape=new THREE.Shape();const p=[[-.72,.85],[.78,.85],[.78,.56],[.18,.56],[.38,.36],[.78,.36],[.78,.08],[.42,.08],[.28,-.08],[.03,-.2],[.7,-.92],[.25,-.92],[-.42,-.18],[-.42,-.02],[-.03,.08],[-.72,.08],[-.72,.36],[-.02,.36],[-.18,.56],[-.72,.56]];shape.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>shape.lineTo(q[0],q[1]));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelThickness:.055,bevelSize:.045,bevelSegments:4,curveSegments:16});geo.center();const m=metallic(C.blue,0x0b3da0,1.35);const mesh=new THREE.Mesh(geo,m);mesh.scale.setScalar(scale);mesh.castShadow=true;const g=new THREE.Group();g.add(mesh);const halo=glowSprite(C.cyan,scale*2.3,.68);halo.position.z=-1.2;g.add(halo);return g}

function orbit(group,r=4.1,tilt=.25,color=C.cyan,opacity=.38){const pts=[];for(let i=0;i<=220;i++){const a=i/220*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.28,Math.sin(a*2)*.07))}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat(color,opacity));l.rotation.x=tilt;l.rotation.z=tilt*.55;group.add(l);return l}
function platform(group,y=-3.05,r=3.6){for(let i=0;i<5;i++){const tor=new THREE.Mesh(new THREE.TorusGeometry(r-i*.52,.022,8,128),new THREE.MeshBasicMaterial({color:i%2?C.violet:C.cyan,transparent:true,opacity:.52-i*.06,blending:THREE.AdditiveBlending,depthWrite:false}));tor.rotation.x=Math.PI/2;tor.position.y=y;tor.scale.y=.6;group.add(tor)}const h=glowSprite(C.blue,6.2,.55);h.position.y=y+.05;h.scale.y=1.15;group.add(h)}
function glassSphere(r=2.85){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(r,isMobile()?36:64,isMobile()?24:48),glass()));const rim=new THREE.Mesh(new THREE.SphereGeometry(r*1.01,48,32),new THREE.MeshBasicMaterial({color:C.cyan,wireframe:true,transparent:true,opacity:.035,depthWrite:false}));g.add(rim);return g}

function makeFunnelWalls(){const g=new THREE.Group();const segments=16,depth=88;function wall(side){const verts=[],idx=[];for(let i=0;i<=segments;i++){const t=i/segments,z=44-t*depth;const inner=THREE.MathUtils.lerp(6.8,1.8,t);const outer=THREE.MathUtils.lerp(10.8,4.4,t);const yTop=THREE.MathUtils.lerp(6.6,3.6,t);const yBot=-yTop*.92;const jitter=Math.sin(i*1.71)*.35;const sx=side;verts.push(sx*(inner+jitter),yTop,z,sx*outer,yTop*.92,z,sx*(inner-.2),yBot,z,sx*(outer+.35),yBot*.9,z)}for(let i=0;i<segments;i++){const a=i*4,b=a+4;idx.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0x071a3b,emissive:0x042456,emissiveIntensity:.55,metalness:.76,roughness:.3,transparent:true,opacity:.72,side:THREE.DoubleSide,flatShading:true}));mesh.receiveShadow=true;g.add(mesh);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo,22),lineMat(side<0?C.blue:C.violet,.18));g.add(edge)}wall(-1);wall(1);for(let i=0;i<18;i++){const t=i/17,z=42-t*84,r=THREE.MathUtils.lerp(6.4,1.7,t);const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,6,100),new THREE.MeshBasicMaterial({color:i%4===0?C.violet:C.blue,transparent:true,opacity:i%4===0?.28:.1,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.z=z;ring.scale.y=.58;g.add(ring)}world.add(g);return g}
const funnelWalls=makeFunnelWalls();

function particles(){const n=isMobile()?650:isTablet()?1100:1800;const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*28;a[i*3+1]=(Math.random()-.5)*18;a[i*3+2]=-Math.random()*150+10}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(a,3));const p=new THREE.Points(geo,new THREE.PointsMaterial({color:0x5bc8ff,size:isMobile()?.025:.035,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(p);return p}const starfield=particles();

function stage(z,type,color=C.blue){const g=new THREE.Group();g.position.z=z;g.userData.type=type;const key=new THREE.PointLight(color,1.5,18,2);key.position.set(type==='services'?3.8:-3.8,3.7,3);g.add(key);const spot=new THREE.SpotLight(color,0,28,Math.PI/7,.5,1.35);spot.position.set(type==='services'?5:-5,6,5);spot.target.position.set(0,0,0);g.add(spot,spot.target);g.userData.key=key;g.userData.spot=spot;world.add(g);return g}
const Z=[0,-15,-30,-45,-60,-75,-90,-105,-120,-135];const stages=[];

function addJourneyNodes(g,mode='acquire'){const count=mode==='retain'?10:7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const node=new THREE.Mesh(new THREE.IcosahedronGeometry(.24+(i%3)*.05,1),metallic(i%3===0?C.violet:C.blue,0x08295f,1));if(mode==='acquire')node.position.set((i%2?-1:1)*(3.8+i*.18),Math.sin(a)*2.1,(i-3)*.15);else node.position.set(Math.cos(a)*3.7,Math.sin(a)*2.25,Math.sin(a)*.45);g.add(node);if(mode!=='acquire'){g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),node.position.clone()]),lineMat(C.cyan,.26)))}}}
function hero(){const g=stage(Z[0],'logo',C.blue);stages.push(g);g.add(glassSphere(2.9));const logo=makeLogo3D(2.9);logo.position.z=.55;g.add(logo);orbit(g,4.4,.34,C.cyan,.45);orbit(g,4.85,-.22,C.violet,.22);platform(g)}
function acquire(){const g=stage(Z[1],'orbit',C.cyan);stages.push(g);g.add(glassSphere(2.5));const logo=makeLogo3D(2.25);logo.position.z=.5;g.add(logo);addJourneyNodes(g,'acquire');orbit(g,4.6,.18,C.cyan,.48);platform(g,-2.9,3.3)}
function transition(){const g=stage(Z[2],'rupee',C.cyan);stages.push(g);const lg=makeLogo3D(1.9);lg.position.set(-1.9,.5,.2);lg.rotation.y=.4;g.add(lg);const r=makeRupee(1.9);r.position.set(1.8,-.25,.1);r.rotation.y=-.35;g.add(r);for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.09+Math.random()*.06),metallic(i%4===0?C.violet:C.blue,0x082b6b,1.4));m.position.set(-.9+i*.085,Math.sin(i*.9)*.55,(Math.random()-.5)*.6);g.add(m)}platform(g,-3.1,3.5)}
function convert(){const g=stage(Z[3],'funnel',C.cyan);stages.push(g);const r=makeRupee(2.2);g.add(r);for(let i=0;i<18;i++){const t=i/17,d=new THREE.Mesh(new THREE.SphereGeometry(.07+(1-t)*.05,10,10),new THREE.MeshBasicMaterial({color:i%4?C.cyan:C.violet}));d.position.set((Math.random()-.5)*5.8*(1-t),THREE.MathUtils.lerp(2.5,-1.5,t)+(Math.random()-.5)*.4,-1-t*3.6);g.add(d)}platform(g,-3.05,3.25)}
function retain(){const g=stage(Z[4],'systems',C.blue);stages.push(g);const r=makeRupee(1.65);g.add(r);addJourneyNodes(g,'retain');for(let i=0;i<3;i++)orbit(g,3.3+i*.45,.12+i*.11,i===1?C.violet:C.cyan,.22+i*.06);platform(g,-2.9,3.1)}
function operate(){const g=stage(Z[5],'services',C.violet);stages.push(g);const core=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.1,2.1,3,3,3),metallic(0x0a2456,0x072b68,1.1));core.rotation.set(.45,.6,.12);g.add(core);const logo=makeLogo3D(1.1);logo.position.z=1.25;g.add(logo);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,m=new THREE.Mesh(new THREE.OctahedronGeometry(.52),metallic(i%2?C.violet:C.blue,0x082b6e,1.25));m.position.set(Math.cos(a)*3.8,Math.sin(a)*2.3,Math.sin(a)*.5);g.add(m);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),m.position.clone()]),lineMat(C.cyan,.34)))}platform(g,-3.0,3.4)}
function scale(){const g=stage(Z[6],'proof',C.violet);stages.push(g);const r=makeRupee(1.65);r.position.x=2.6;g.add(r);for(let i=0;i<9;i++){const h=.5+i*.38;const bar=new THREE.Mesh(new THREE.BoxGeometry(.34,h,.34),metallic(i<6?C.blue:C.violet,0x08295f,1.2));bar.position.set(-4+i*.58,-2.25+h/2,-.6+i*.05);g.add(bar)}const pts=[];for(let i=0;i<11;i++)pts.push(new THREE.Vector3(-4+i*.76,-1.6+i*.33+Math.sin(i)*.16,.45));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat(C.cyan,.9)));const l=glowSprite(C.violet,4,.4);l.position.set(0,1,-1);g.add(l)}
function proof(){const g=stage(Z[7],'insights',C.cyan);stages.push(g);for(let i=0;i<4;i++){const slab=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.25,.12),new THREE.MeshPhysicalMaterial({color:0x061a3e,emissive:i%2?0x0b2762:0x083b78,emissiveIntensity:.8,metalness:.65,roughness:.18,transparent:true,opacity:.9}));slab.position.set((i%2?1:-1)*2.6,(i<2?1:-1)*1.35,(i-1.5)*.2);slab.rotation.y=(i%2?-.16:.16);g.add(slab)}const r=makeRupee(1.25);g.add(r);platform(g,-3,3.15)}
function insights(){const g=stage(Z[8],'return',C.violet);stages.push(g);for(let i=0;i<7;i++){const cube=new THREE.Mesh(new THREE.BoxGeometry(.75,.75,.75),metallic(i%3===0?C.violet:C.blue,0x082c70,1.15));cube.position.set((Math.random()-.5)*6.8,(Math.random()-.5)*4.2,(Math.random()-.5)*1.6);cube.rotation.set(Math.random(),Math.random(),Math.random());g.add(cube)}for(let i=0;i<4;i++){const beam=new THREE.Mesh(new THREE.CylinderGeometry(.015,.07,5.8,8),new THREE.MeshBasicMaterial({color:i%2?C.violet:C.cyan,transparent:true,opacity:.28,blending:THREE.AdditiveBlending}));beam.rotation.z=Math.PI/2;beam.rotation.y=(i-1.5)*.13;g.add(beam)}const r=makeRupee(1.4);r.position.z=.4;g.add(r)}
function finale(){const g=stage(Z[9],'final',C.blue);stages.push(g);g.add(glassSphere(2.75));const logo=makeLogo3D(2.85);logo.position.z=.55;g.add(logo);orbit(g,4.3,.28,C.cyan,.45);orbit(g,4.75,-.2,C.violet,.23);platform(g,-3.1,3.7)}
hero();acquire();transition();convert();retain();operate();scale();proof();insights();finale();

let centers=[];function measure(){centers=sections.map(s=>s.offsetTop+s.offsetHeight/2);renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile()?1.25:isTablet()?1.55:2));renderer.setSize(innerWidth,innerHeight,false);composer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=isMobile()?56:isTablet()?50:44;camera.updateProjectionMatrix()}addEventListener('resize',measure,{passive:true});measure();
function scrollState(){const y=scrollY+innerHeight*.5;let a=0;for(let i=0;i<centers.length-1;i++)if(y>=centers[i])a=i;const b=Math.min(a+1,centers.length-1),den=Math.max(1,centers[b]-centers[a]),t=b===a?0:THREE.MathUtils.clamp((y-centers[a])/den,0,1);return{a,b,t,virtual:a+t}}
const mouse={x:0,y:0};addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=e.clientY/innerHeight*2-1},{passive:true});
let camZ=9,camX=0,camY=.2,last=-1;const clock=new THREE.Clock();const tmp=new THREE.Vector3();
function splineOffset(v){return{x:Math.sin(v*.72)*(.5+Math.min(v,6)*.08),y:Math.sin(v*.48)*.32-Math.max(0,v-2)*.055,roll:Math.sin(v*.58)*.018}}
function activate(i){sections.forEach((s,k)=>s.classList.toggle('active',k===i));document.body.dataset.scene=sections[i]?.dataset.scene||'logo'}
function animate(){const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime,st=scrollState(),ease=st.t*st.t*(3-2*st.t),targetZ=THREE.MathUtils.lerp(Z[st.a]+9,Z[st.b]+9,ease),off=splineOffset(st.virtual);camZ=THREE.MathUtils.lerp(camZ,targetZ,1-Math.pow(.0015,dt));camX=THREE.MathUtils.lerp(camX,off.x+(reduceMotion?0:mouse.x*(isMobile()?.03:.16)),.05);camY=THREE.MathUtils.lerp(camY,off.y+(reduceMotion?0:-mouse.y*.08),.05);camera.position.set(camX,camY,camZ);camera.rotation.z=off.roll;camera.lookAt(camX*.2,camY*.15,camZ-8.7);const nearest=Math.round(st.virtual);if(nearest!==last){last=nearest;activate(nearest)}stages.forEach((g,i)=>{const d=Math.abs((Z[i]+9)-camZ),focus=Math.max(0,1-d/17),s=.9+focus*.13;tmp.setScalar(s);g.scale.lerp(tmp,.08);g.userData.key.intensity=.5+focus*7.5;g.userData.spot.intensity=focus*11;g.rotation.y=Math.sin(time*.12+i)*.012+(reduceMotion?0:mouse.x*.008);g.children.forEach(c=>{if(c.geometry?.type==='TorusGeometry')c.rotation.z+=dt*.04})});const mid=1-Math.min(1,Math.abs(st.virtual-4.5)/4.5);funnelWalls.rotation.z=Math.sin(time*.09)*.012;funnelWalls.children.forEach(c=>{if(c.material?.transparent)c.material.opacity=Math.min(.8,(c.material.opacity||.1)+mid*.002)});starfield.rotation.z=time*.0015;bloom.strength=isMobile()?.48:.72+mid*.32;composer.render();requestAnimationFrame(animate)}animate();

const menu=document.querySelector('.menu'),mobile=document.querySelector('.mobile-menu');if(menu&&mobile){menu.addEventListener('click',()=>mobile.classList.toggle('open'));mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')))}
