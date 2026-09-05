import * as THREE from "three";
const BRAND_MARK="assets/images/scaleops-mark-brandbook.svg?v=v6-brandbook-20260905";
document.querySelectorAll('.site-header .brand img,.site-footer img,.webgl-fallback img').forEach(img=>{img.src=BRAND_MARK;img.decoding='sync';});
document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=BRAND_MARK;link.type='image/svg+xml';});
const load=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(url,onLoad,onProgress,onError){const resolved=typeof url==='string'&&url.includes('scaleops-mark-master.png')?BRAND_MARK:url;return load.call(this,resolved,onLoad,onProgress,onError)};
await import('./immersive-v6.js?v=v6-cinematic-20260905');