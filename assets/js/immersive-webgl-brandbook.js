import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const BRAND_MARK = "assets/images/scaleops-mark-brandbook.svg?v=brandbook-final-20260905";

// Force every visible brand surface to use the self-contained brandbook asset.
document.querySelectorAll(".site-header .brand img,.site-footer img,.webgl-fallback img").forEach((img) => {
  img.src = BRAND_MARK;
  img.decoding = "sync";
});
document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach((link) => {
  link.href = BRAND_MARK;
  link.type = "image/svg+xml";
});

// Intercept the production texture request before the existing scene module runs.
// This keeps the WebGL geometry/animation intact while guaranteeing that the
// exact self-contained brandbook mark is used inside every 3D logo plane.
const originalTextureLoad = THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load = function patchedTextureLoad(url, onLoad, onProgress, onError) {
  const resolved = typeof url === "string" && url.includes("scaleops-mark-exact.png") ? BRAND_MARK : url;
  return originalTextureLoad.call(this, resolved, onLoad, onProgress, onError);
};

await import("./immersive-webgl.js?v=brandbook-final-20260905");
