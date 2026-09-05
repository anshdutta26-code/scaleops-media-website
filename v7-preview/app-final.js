import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LOGO_URI, LOGO_ASPECT } from './logo-data.js?v=final2';

const canvas = document.querySelector('#webgl');
const sections = [...document.querySelectorAll('.scene')];
const logoOverlay = document.querySelector('#logo-overlay');
const favicon = document.querySelector('#scaleops-favicon');
const menu = document.querySelector('.menu');
const mobileMenu = document.querySelector('.mobile-menu');

// Exact uploaded ScaleOps artwork is injected as a data URI so there is no image-path/cache failure.
document.querySelectorAll('.js-scaleops-logo').forEach((img) => {
  img.src = LOGO_URI;
  img.decoding = 'async';
});
if (favicon) favicon.href = LOGO_URI;

if (menu && mobileMenu) {
  menu.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

const isMobile = () => innerWidth < 700;
const isTablet = () => innerWidth >= 700 && innerWidth < 1050;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
} catch (error) {
  document.documentElement.classList.add('no-webgl');
  throw error;
}

const pixelRatio = () => Math.min(devicePixelRatio || 1, isMobile() ? 1.25 : isTablet() ? 1.55 : 2);
renderer.setPixelRatio(pixelRatio());
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = !isMobile();
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01040a);
scene.fog = new THREE.FogExp2(0x020713, isMobile() ? 0.0175 : 0.0115);

const camera = new THREE.PerspectiveCamera(isMobile() ? 58 : isTablet() ? 51 : 44, innerWidth / innerHeight, 0.1, 250);
scene.add(camera);
const world = new THREE.Group();
scene.add(world);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isMobile() ? 0.28 : 0.48, 0.44, 0.31);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const C = {
  blue: 0x2f80ed,
  cyan: 0x69dfff,
  violet: 0x7657ff,
  navy: 0x06142e,
  deep: 0x020711,
  white: 0xeaf8ff
};

scene.add(new THREE.HemisphereLight(0x335b91, 0x010205, 0.46));
const rim = new THREE.DirectionalLight(C.cyan, 1.25);
rim.position.set(-7, 8, 8);
scene.add(rim);
const fill = new THREE.DirectionalLight(C.violet, 0.68);
fill.position.set(7, 1, 3);
scene.add(fill);

const textureLoader = new THREE.TextureLoader();
const markTex = textureLoader.load(
  LOGO_URI,
  (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    t.needsUpdate = true;
  },
  undefined,
  () => document.documentElement.classList.add('texture-fallback')
);
markTex.colorSpace = THREE.SRGBColorSpace;

const lineMat = (color = C.cyan, opacity = 0.25) => new THREE.LineBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false
});
const glowMat = (color = C.cyan, opacity = 0.28) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});
const metalMat = (color = C.blue, emissive = 0x082d73, intensity = 0.82) => new THREE.MeshPhysicalMaterial({
  color,
  emissive,
  emissiveIntensity: intensity,
  metalness: 0.88,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.08
});

function glowSprite(hex = C.blue, scale = 4, opacity = 0.55) {
  const c = document.createElement('canvas');
  c.width = c.height = 192;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(96, 96, 0, 96, 96, 96);
  const h = `#${hex.toString(16).padStart(6, '0')}`;
  g.addColorStop(0, 'rgba(255,255,255,.96)');
  g.addColorStop(0.08, h);
  g.addColorStop(0.34, `${h}55`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 192, 192);
  const texture = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

function makeLogo(scale = 3) {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(scale * LOGO_ASPECT, scale);
  // A single exact plane prevents ghosted or doubled logo silhouettes.
  const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    map: markTex,
    transparent: true,
    alphaTest: 0.01,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide
  }));
  front.position.z = 0.14;
  front.renderOrder = 100;
  group.add(front);
  const halo = glowSprite(C.blue, scale * 1.8, 0.26);
  halo.position.z = -0.55;
  halo.renderOrder = 10;
  group.add(halo);
  group.renderOrder = 100;
  return group;
}

function makeGlassSphere(radius = 3) {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x06172f,
    roughness: 0.08,
    metalness: 0.06,
    transmission: 0.22,
    transparent: true,
    opacity: 0.14,
    clearcoat: 1,
    ior: 1.3,
    thickness: 0.9,
    emissive: 0x03172f,
    emissiveIntensity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, isMobile() ? 36 : 56, isMobile() ? 24 : 36), material);
  sphere.renderOrder = 1;
  return sphere;
}

function addOrbit(group, radius = 4, tilt = 0.2, color = C.cyan, opacity = 0.26) {
  const points = [];
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.27, Math.sin(a * 2) * 0.05));
  }
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat(color, opacity));
  ring.rotation.x = tilt;
  ring.rotation.z = tilt * 0.48;
  group.add(ring);
  return ring;
}

function addPlatform(group, y = -3, radius = 3.3) {
  for (let i = 0; i < 4; i++) {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(radius - i * 0.48, 0.014, 5, 96), glowMat(i % 2 ? C.violet : C.cyan, 0.28 - i * 0.04));
    torus.rotation.x = Math.PI / 2;
    torus.position.y = y;
    torus.scale.y = 0.62;
    group.add(torus);
  }
  const halo = glowSprite(C.blue, 4.6, 0.24);
  halo.position.y = y + 0.04;
  halo.scale.y = 0.95;
  group.add(halo);
}

function makeRupee(scale = 2) {
  // Recognisable Indian rupee silhouette, bevelled and genuinely extruded.
  const s = new THREE.Shape();
  const p = [
    [-0.82, 0.88], [0.82, 0.88], [0.82, 0.62], [0.22, 0.62], [0.40, 0.45], [0.82, 0.45],
    [0.82, 0.18], [0.45, 0.18], [0.34, 0.02], [0.06, -0.16], [0.72, -0.90], [0.28, -0.90],
    [-0.42, -0.08], [-0.42, 0.13], [-0.02, 0.18], [-0.82, 0.18], [-0.82, 0.45], [-0.04, 0.45],
    [-0.20, 0.62], [-0.82, 0.62]
  ];
  s.moveTo(...p[0]);
  p.slice(1).forEach((q) => s.lineTo(...q));
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.055, bevelSize: 0.045, bevelSegments: 5, curveSegments: 12 });
  geo.center();
  const mesh = new THREE.Mesh(geo, metalMat(C.blue, 0x0a3b99, 1.05));
  mesh.scale.setScalar(scale);
  mesh.castShadow = true;
  const group = new THREE.Group();
  group.add(mesh);
  const halo = glowSprite(C.cyan, scale * 2.15, 0.34);
  halo.position.z = -1;
  group.add(halo);
  return group;
}

function makeFunnelWalls() {
  const group = new THREE.Group();
  const steps = 30;
  const levels = 7;
  for (const side of [-1, 1]) {
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const z = 8 - t * 140;
      // Protected camera corridor: geometry never crosses ±5.9 on X.
      const inner = 6.25 + Math.pow(Math.abs(t - 0.48) * 2, 1.4) * 2.0;
      for (let j = 0; j < levels; j++) {
        const yn = (j / (levels - 1)) * 2 - 1;
        const y = yn * (4.35 + 0.28 * Math.sin(t * Math.PI));
        const x = side * (inner + Math.abs(yn) * 1.15 + 0.12 * Math.sin(i * 0.68 + j));
        vertices.push(x, y, z);
      }
    }
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < levels - 1; j++) {
        const a = i * levels + j;
        const b = (i + 1) * levels + j;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x06152c,
      emissive: 0x04152f,
      emissiveIntensity: 0.34,
      metalness: 0.84,
      roughness: 0.29,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), lineMat(side < 0 ? C.blue : C.violet, 0.075)));
  }
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const z = 3 - t * 130;
    const radius = 5.3 + Math.pow(Math.abs(t - 0.48) * 2, 1.3) * 1.35;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 5, 90), glowMat(i % 4 === 0 ? C.violet : C.blue, i % 4 === 0 ? 0.14 : 0.05));
    ring.rotation.x = Math.PI / 2;
    ring.position.z = z;
    ring.scale.y = 0.58;
    group.add(ring);
  }
  world.add(group);
  return group;
}

function addNodes(group, count = 9, radius = 3.7) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14 + (i % 3) * 0.035, 1), metalMat(i % 3 === 0 ? C.violet : C.blue, 0x06245a, 0.85));
    node.position.set(Math.cos(a) * radius, Math.sin(a) * 1.85, Math.sin(a) * 0.42);
    group.add(node);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), node.position.clone()]), lineMat(C.cyan, 0.13)));
  }
}

function makePanel(width = 2.15, height = 1.08) {
  const group = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: 0x071a39, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }));
  group.add(panel);
  const points = [[-width / 2, -height / 2], [width / 2, -height / 2], [width / 2, height / 2], [-width / 2, height / 2], [-width / 2, -height / 2]].map((v) => new THREE.Vector3(v[0], v[1], 0.01));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat(C.cyan, 0.34)));
  return group;
}

const funnel = makeFunnelWalls();

const starGeo = new THREE.BufferGeometry();
const starCount = isMobile() ? 380 : isTablet() ? 680 : 1050;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPositions[i * 3] = (Math.random() - 0.5) * 24;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  starPositions[i * 3 + 2] = 10 - Math.random() * 150;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x70dfff, size: isMobile() ? 0.017 : 0.026, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(stars);

const Z = [0, -16, -32, -48, -64, -80, -96, -112, -128];
const groups = [];
function makeStage(index, color = C.blue) {
  const group = new THREE.Group();
  group.position.z = Z[index];
  const key = new THREE.PointLight(color, 0.7, 17, 2);
  key.position.set(index % 2 ? 4 : -4, 4, 4);
  const spot = new THREE.SpotLight(color, 0, 25, Math.PI / 8, 0.55, 1.5);
  spot.position.set(index % 2 ? 5 : -5, 6, 5);
  spot.target.position.set(0, 0, 0);
  group.add(key, spot, spot.target);
  group.userData = { key, spot };
  groups.push(group);
  world.add(group);
  return group;
}

function buildWorld() {
  let g = makeStage(0, C.blue);
  g.add(makeGlassSphere(2.8));
  const logo0 = makeLogo(3.05); logo0.position.z = 0.68; g.add(logo0);
  addOrbit(g, 4.0, 0.25, C.cyan, 0.30); addOrbit(g, 4.45, -0.15, C.violet, 0.14); addPlatform(g, -2.9, 3.25);

  g = makeStage(1, C.cyan);
  g.add(makeGlassSphere(2.35));
  const logo1 = makeLogo(2.28); logo1.position.z = 0.62; g.add(logo1);
  addNodes(g, 10, 3.85); addOrbit(g, 4.05, 0.18, C.cyan, 0.28); addPlatform(g, -2.8, 3.05);

  g = makeStage(2, C.cyan);
  // Conversion aperture: camera passes through the open centre, never through geometry.
  for (let i = 0; i < 7; i++) {
    const r = 4.4 - i * 0.38;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 100), glowMat(i % 2 ? C.blue : C.cyan, 0.16 + i * 0.025));
    ring.position.z = -0.7 - i * 0.35;
    ring.scale.y = 0.62;
    g.add(ring);
  }
  for (let i = 0; i < 36; i++) {
    const t = i / 35;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (1 - t) * 0.025, 8, 8), new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? C.violet : C.cyan }));
    node.position.set((Math.random() - 0.5) * 4.4 * (1 - t), 1.8 - t * 3.0, -1.1 - t * 3.2);
    g.add(node);
  }
  addPlatform(g, -2.75, 3.0);

  g = makeStage(3, C.cyan);
  const value = makeRupee(1.9); value.rotation.y = -0.08; g.add(value);
  addOrbit(g, 3.6, 0.19, C.cyan, 0.24); addOrbit(g, 4.0, -0.14, C.violet, 0.14); addPlatform(g, -2.9, 3.2);

  g = makeStage(4, C.blue);
  const retentionCore = makeRupee(1.05); g.add(retentionCore);
  addNodes(g, 12, 3.45); addOrbit(g, 3.2, 0.15, C.cyan, 0.18); addPlatform(g, -2.8, 2.95);

  g = makeStage(5, C.violet);
  const core = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.55, 1.55, 2, 2, 2), metalMat(0x0b2557, 0x06245c, 0.72));
  core.rotation.set(0.46, 0.62, 0.1); g.add(core); addNodes(g, 8, 3.4); addPlatform(g, -2.9, 3.0);

  g = makeStage(6, C.violet);
  const scaleRupee = makeRupee(1.05); scaleRupee.position.x = 2.35; g.add(scaleRupee);
  for (let i = 0; i < 8; i++) {
    const h = 0.5 + i * 0.32;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), metalMat(i < 5 ? C.blue : C.violet, 0x06255e, 0.9));
    bar.position.set(-3.5 + i * 0.52, -2.0 + h / 2, -0.35 + i * 0.03);
    g.add(bar);
  }
  const proofLine = [];
  for (let i = 0; i < 9; i++) proofLine.push(new THREE.Vector3(-3.45 + i * 0.5, -1.45 + i * 0.27 + Math.sin(i * 0.7) * 0.16, 0));
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(proofLine), lineMat(C.cyan, 0.52)));
  addPlatform(g, -2.9, 3.05);

  g = makeStage(7, C.cyan);
  for (let i = 0; i < 5; i++) {
    const p = makePanel();
    const a = (i / 5) * Math.PI * 2;
    p.position.set(Math.cos(a) * 3.35, Math.sin(a) * 1.75, Math.sin(a) * 0.42);
    p.rotation.y = -a + 0.2;
    g.add(p);
  }
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 2), metalMat(C.blue, 0x07367d, 0.9)));
  addOrbit(g, 3.5, 0.18, C.cyan, 0.19); addPlatform(g, -2.9, 2.95);

  g = makeStage(8, C.blue);
  g.add(makeGlassSphere(2.8));
  const logo8 = makeLogo(3.05); logo8.position.z = 0.68; g.add(logo8);
  addOrbit(g, 4.0, 0.24, C.cyan, 0.30); addOrbit(g, 4.45, -0.14, C.violet, 0.14); addPlatform(g, -2.9, 3.25);
}
buildWorld();

// Controlled spline remains inside the protected funnel corridor.
const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.05, 9.5),
  new THREE.Vector3(-0.22, 0.08, -6),
  new THREE.Vector3(0.32, -0.06, -22),
  new THREE.Vector3(-0.34, 0.08, -38),
  new THREE.Vector3(0.34, -0.09, -54),
  new THREE.Vector3(-0.24, 0.07, -70),
  new THREE.Vector3(0.34, -0.04, -86),
  new THREE.Vector3(-0.24, 0.06, -102),
  new THREE.Vector3(0.14, 0, -119)
], false, 'catmullrom', 0.42);
const lookPath = new THREE.CatmullRomCurve3(Z.map((z, i) => new THREE.Vector3(i % 2 ? 0.06 : -0.06, 0, z - 1.2)), false, 'catmullrom', 0.42);

let centers = [];
function measure() {
  centers = sections.map((s) => s.offsetTop + s.offsetHeight / 2);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = isMobile() ? 58 : isTablet() ? 51 : 44;
  camera.updateProjectionMatrix();
  composer.setSize(innerWidth, innerHeight);
  bloom.strength = isMobile() ? 0.28 : 0.48;
}
addEventListener('resize', measure, { passive: true });
measure();

const mouse = new THREE.Vector2();
addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
}, { passive: true });

function scrollProgress() {
  return THREE.MathUtils.clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight), 0, 1);
}
function activeIndex() {
  const y = scrollY + innerHeight * 0.5;
  let best = 0;
  let distance = Infinity;
  centers.forEach((c, i) => {
    const d = Math.abs(c - y);
    if (d < distance) { distance = d; best = i; }
  });
  return best;
}
function syncDOM(progress, index) {
  sections.forEach((s, i) => s.classList.toggle('active', i === index));
  // The central mark is rendered by WebGL. Keeping the DOM overlay hidden
  // prevents a second copy from sitting over the live scene.
  const showLogo = false;
  if (logoOverlay) {
    logoOverlay.style.opacity = showLogo ? '1' : '0';
    logoOverlay.style.visibility = showLogo ? 'visible' : 'hidden';
    const parallax = isMobile() ? 0 : (progress - 0.5) * 7;
    logoOverlay.style.transform = `translate(-50%,-50%) perspective(1000px) rotateY(${parallax}deg) rotateX(${-parallax * 0.18}deg) scale(${showLogo ? 1 : 0.95})`;
  }
  const labels = [...document.querySelectorAll('.journey-label span')];
  labels.forEach((el, i) => el.classList.toggle('hot', index === i + 1 || index === Math.min(i + 2, 6)));
}

const clock = new THREE.Clock();
const cameraCurrent = new THREE.Vector3(0, 0, 9.5);
const lookCurrent = new THREE.Vector3(0, 0, -1);
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const raw = scrollProgress();
  const progress = reducedMotion ? Math.round(raw * 8) / 8 : raw;
  const targetPos = cameraPath.getPointAt(progress);
  const targetLook = lookPath.getPointAt(progress);
  if (!isMobile()) {
    targetPos.x += mouse.x * (isTablet() ? 0.08 : 0.14);
    targetPos.y -= mouse.y * (isTablet() ? 0.04 : 0.065);
  }
  cameraCurrent.lerp(targetPos, 1 - Math.pow(0.001, dt));
  lookCurrent.lerp(targetLook, 1 - Math.pow(0.0013, dt));
  camera.position.copy(cameraCurrent);
  camera.lookAt(lookCurrent);

  const index = activeIndex();
  syncDOM(progress, index);
  groups.forEach((g, i) => {
    // Reveal only the active scroll stage. Future and previous graphics must
    // not remain visible through the tunnel behind the current composition.
    g.visible = i === index;
    if (!g.visible) return;
    const d = Math.abs(g.position.z - camera.position.z);
    const focus = THREE.MathUtils.clamp(1 - d / 18, 0, 1);
    g.scale.setScalar(0.97 + focus * 0.045);
    g.rotation.y = Math.sin(clock.elapsedTime * 0.12 + i) * 0.009;
    g.userData.key.intensity = 0.28 + focus * 2.7;
    g.userData.spot.intensity = focus * 4.2;
  });
  funnel.rotation.z = Math.sin(clock.elapsedTime * 0.065) * 0.003;
  stars.rotation.z = clock.elapsedTime * 0.001;
  composer.render();
  requestAnimationFrame(animate);
}
animate();
