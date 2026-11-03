/* =========================================================
   NASRPAC — real-time 3D hero (Three.js)
   One continuous Nasrpac factory. Scrolling flies the camera
   between five stations; machines, sheets, forklifts and people
   are animated. Falls back to the SVG scenes if WebGL is missing.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { EffectComposer } from './vendor/EffectComposer.js';
import { RenderPass } from './vendor/RenderPass.js';
import { GTAOPass } from './vendor/GTAOPass.js';
import { OutputPass } from './vendor/OutputPass.js';

const hero = document.querySelector('.hs');
const host = hero && hero.querySelector('.hs__slides');
if (hero && host) init().catch((err) => console.warn('[nasrpac] 3D hero disabled:', err));

async function init() {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => innerWidth <= 860;

  /* ---------- renderer ---------- */
  const canvas = document.createElement('canvas');
  canvas.className = 'hs__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { throw new Error('WebGL unavailable'); }
  host.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const SKY = new THREE.Color('#dfe5ea');
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 140, 300);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 600);

  /* ---------- post-processing: ambient occlusion (desktop only) ---------- */
  let composer = null;
  if (!isSmall()) {
    try {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
      composer = new EffectComposer(renderer, rt);
      composer.addPass(new RenderPass(scene, camera));
      const ao = new GTAOPass(scene, camera, 1, 1);
      ao.output = GTAOPass.OUTPUT.Default;
      ao.blendIntensity = 1.0;
      ao.updateGtaoMaterial({ radius: 1.2, distanceExponent: 1.5, thickness: 1.4, scale: 1.15, samples: 16 });
      ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 7, rings: 2, samples: 16 });
      composer.addPass(ao);
      composer.addPass(new OutputPass());
    } catch (e) { console.warn('[nasrpac] AO disabled:', e); composer = null; }
  }

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight('#f4f8ff', '#c9cfd4', 0.6));
  const sun = new THREE.DirectionalLight('#fff0d8', 3.6);
  sun.castShadow = true;
  const SH = isSmall() ? 1024 : 4096;
  sun.shadow.mapSize.set(SH, SH);
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 180 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const SUN_OFFSET = new THREE.Vector3(-34, 58, 40);

  /* ---------- utilities ---------- */
  let seed = 1973;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const seg = (u, a, b) => clamp((u - a) / (b - a));

  const std = (color, roughness = 0.7, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const canvasTex = (w, h, draw, repeat) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  };

  const logoImg = new Image();
  logoImg.src = 'logo.png';
  await logoImg.decode();
  const logoTex = new THREE.Texture(logoImg);
  logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = maxAniso; logoTex.needsUpdate = true;

  /* ---------- textures ---------- */
  const concreteTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#d8dce0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {           // soft blotches
      const x = rnd() * w, y = rnd() * h, r = 40 + rnd() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.03 + rnd() * 0.05, dark = rnd() > 0.5;
      gr.addColorStop(0, dark ? `rgba(120,128,136,${a})` : `rgba(255,255,255,${a})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
    for (let i = 0; i < 14000; i++) {          // grain
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(90,98,106,.12)';
      g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2);
    }
    g.strokeStyle = 'rgba(120,128,136,.28)'; g.lineWidth = 2;   // expansion joints
    g.strokeRect(1, 1, w - 2, h - 2);
  }, [7.5, 4.5]);

  const tileTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#eef2f5'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(140,150,160,.35)'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  }, [9, 7]);

  // Carton artwork, built up ink by ink: 0 blank → Y → M → C → K(logo)
  const artTex = [0, 1, 2, 3, 4].map((stage) => canvasTex(512, 360, (g, w, h) => {
    g.fillStyle = '#f7f5ef'; g.fillRect(0, 0, w, h);
    const bands = [['#f59e1b', 268], ['#e5322d', 294], ['#1e9be0', 320]];
    bands.forEach(([c, y], i) => { if (stage > i) { g.fillStyle = c; g.fillRect(0, y, w, 18); } });
    if (stage > 3) g.drawImage(logoImg, w / 2 - 105, 28, 210, 210);
    g.strokeStyle = 'rgba(0,0,0,.08)'; g.strokeRect(0, 0, w, h);
  }));
  const boxTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c59c6c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(90,60,30,${rnd() * 0.08})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.fillStyle = 'rgba(210,180,140,.9)'; g.fillRect(w * 0.44, 0, w * 0.12, h);           // tape
    g.drawImage(logoImg, 18, h - 74, 56, 56);
  });
  const rollEndTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b48a5c'; g.fillRect(0, 0, w, h);
    for (let r = 120; r > 30; r -= 3) { g.strokeStyle = `rgba(80,52,25,${0.08 + rnd() * 0.12})`; g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#6f5a44'; g.beginPath(); g.arc(128, 128, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2b2b2b'; g.beginPath(); g.arc(128, 128, 18, 0, Math.PI * 2); g.fill();
  });
  const screenTex = canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = '#082436'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,180,230,.25)';
    for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.strokeStyle = '#47c6ff'; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x <= w; x += 16) g.lineTo(x, 110 - Math.sin(x / 30) * 30 - x / 8);
    g.stroke();
    g.fillStyle = '#f59e1b'; [40, 70, 55, 90].forEach((v, i) => g.fillRect(160 + i * 22, h - v, 14, v));
  });
  const contactTex = canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(0.55, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });

  /* ---------- materials ---------- */
  const M = {
    ground: std('#dce1e5', 0.95),
    yard: std('#c2c8ce', 0.92),
    slabSide: std('#bfc6cc', 0.9),
    floor: std('#ffffff', 0.68, 0, { map: concreteTex, envMapIntensity: 0.6 }),
    labFloor: std('#ffffff', 0.5, 0, { map: tileTex }),
    wall: std('#eef1f3', 0.88),
    coping: std('#9aa3ab', 0.6, 0.2),
    machine: std('#e4e8eb', 0.38, 0.25),
    machineDark: std('#39424a', 0.5, 0.3),
    steel: std('#b9c1c8', 0.35, 0.7),
    steelDark: std('#4c555d', 0.45, 0.6),
    rubber: std('#22272c', 0.85),
    blue: std('#1e9be0', 0.45, 0.1),
    red: std('#e5322d', 0.5, 0.05),
    orange: std('#f59e1b', 0.5, 0.05),
    yellowLine: std('#f2c230', 0.6),
    white: std('#f6f7f8', 0.5),
    wood: std('#b88a57', 0.85),
    paper: std('#f7f6f1', 0.75),
    kraft: std('#ffffff', 0.85, 0, { map: boxTex }),
    roll: [std('#c19567', 0.85), std('#ffffff', 0.85, 0, { map: rollEndTex }), std('#ffffff', 0.85, 0, { map: rollEndTex })],
    glass: std('#bfe2f4', 0.05, 0.1, { transparent: true, opacity: 0.22, depthWrite: false }),
    glassDark: std('#4f6878', 0.15, 0.5),
    screen: std('#ffffff', 0.3, 0, { map: screenTex, emissive: '#ffffff', emissiveMap: screenTex, emissiveIntensity: 0.85 }),
    logo: std('#ffffff', 0.55, 0, { map: logoTex, transparent: true, alphaTest: 0.05, polygonOffset: true, polygonOffsetFactor: -2 }),
    ink: ['#f7cf1d', '#e3197b', '#0aa5df', '#1f2328'].map((c) => std(c, 0.35, 0.1)),
    rackBlue: std('#1e6fb8', 0.45, 0.4),
    rackOrange: std('#f08a1c', 0.45, 0.3),
    tree: [std('#33a88e', 0.85, 0, { flatShading: true }), std('#2a937b', 0.85, 0, { flatShading: true }), std('#46b89c', 0.85, 0, { flatShading: true })],
    trunk: std('#6b4f3a', 0.9),
    tank: std('#2b86c6', 0.4, 0.3),
    contact: new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.55 }),
  };
  const artMat = artTex.map((t) => std('#ffffff', 0.55, 0, { map: t, side: THREE.DoubleSide }));
  const cartonMats = [M.paper, M.paper, artMat[4], M.paper, M.paper, M.paper];

  /* ---------- geometry helpers ---------- */
  const staticRoot = new THREE.Group();   // merged into a few draw calls
  const dyn = new THREE.Group();          // animated objects
  scene.add(staticRoot, dyn);

  function mk(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m; }
  function geoBox(w, h, d, r) {
    if (!r) return new THREE.BoxGeometry(w, h, d);
    return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  }
  // box with its BOTTOM at y, centred on x/z
  function B(parent, w, h, d, mat, x, y, z, r = 0) {
    const m = mk(geoBox(w, h, d, r), mat); m.position.set(x, y + h / 2, z); parent.add(m); return m;
  }
  function C(parent, rt, rb, h, mat, x, y, z, segs = 24) {
    const m = mk(new THREE.CylinderGeometry(rt, rb, h, segs), mat); m.position.set(x, y + h / 2, z); parent.add(m); return m;
  }
  function plane(parent, w, d, mat, x, y, z, rotX = -Math.PI / 2) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = rotX; m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); return m;
  }
  function contact(x, z, w, d, o) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.35, d * 1.35), o ? M.contact.clone() : M.contact);
    if (o) m.material.opacity = o;
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); m.renderOrder = 2; m.userData.noMerge = true;
    staticRoot.add(m);
  }
  function decal(parent, size, x, y, z, rotY = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), M.logo);
    m.position.set(x, y, z); m.rotation.y = rotY; m.userData.noMerge = true; parent.add(m); return m;
  }
  function pallet(parent, x, z, load = 'kraft', h = 1.0, y = 0) {
    B(parent, 1.2, 0.15, 1.0, M.wood, x, y, z);
    if (load === 'kraft') B(parent, 1.1, h, 0.95, M.kraft, x, y + 0.15, z, 0.02);
    if (load === 'paper') B(parent, 1.1, h, 0.85, M.paper, x, y + 0.15, z, 0.01);
    contact(x, z, 1.2, 1.0);
  }

  /* ---------- movers (people, forklifts) ---------- */
  const anims = [];
  const lerpAngle = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
  function pingPong(obj, a, b, speed, pause, offset, onMove) {
    const A = new THREE.Vector3(a[0], 0, a[1]), Bv = new THREE.Vector3(b[0], 0, b[1]);
    const L = Math.max(0.01, A.distanceTo(Bv)), Tw = L / speed, cycle = 2 * (Tw + pause);
    obj.position.copy(A);
    anims.push((t, dt) => {
      const s = (t + offset) % cycle;
      let from, to, k, moving;
      if (s < Tw) { from = A; to = Bv; k = s / Tw; moving = true; }
      else if (s < Tw + pause) { from = Bv; to = A; k = 0; moving = false; }
      else if (s < 2 * Tw + pause) { from = Bv; to = A; k = (s - Tw - pause) / Tw; moving = true; }
      else { from = A; to = Bv; k = 0; moving = false; }
      obj.position.lerpVectors(from, to, smooth(k) * 0.15 + k * 0.85);
      const head = Math.atan2(to.x - from.x, to.z - from.z);
      obj.rotation.y = lerpAngle(obj.rotation.y, head, 1 - Math.exp(-dt * 5));
      onMove && onMove(t, moving);
    });
  }

  const SKIN = ['#c99a7a', '#a8775a', '#e0b897', '#8d5f45'];
  function person(kind = 'worker') {
    const g = new THREE.Group();
    const lab = kind === 'lab';
    const pants = std(lab ? '#3a4553' : '#27364a', 0.8);
    const top = lab ? std('#f4f6f8', 0.7) : std('#27364a', 0.8);
    const skin = std(SKIN[Math.floor(rnd() * SKIN.length)], 0.7);
    const legs = [-0.11, 0.11].map((x) => {
      const pivot = new THREE.Group(); pivot.position.set(x, 0.9, 0);
      const leg = mk(new THREE.CylinderGeometry(0.075, 0.07, 0.85, 10), pants); leg.position.y = -0.425; pivot.add(leg);
      const shoe = mk(new THREE.BoxGeometry(0.12, 0.08, 0.24), M.rubber); shoe.position.set(0, -0.86, 0.04); pivot.add(shoe);
      g.add(pivot); return pivot;
    });
    const torso = mk(new THREE.CapsuleGeometry(0.19, 0.42, 4, 12), top); torso.position.y = 1.2; g.add(torso);
    if (lab) { const coat = mk(new THREE.CylinderGeometry(0.21, 0.25, 0.62, 14), top); coat.position.y = 0.98; g.add(coat); }
    else {
      const vest = mk(new THREE.CylinderGeometry(0.205, 0.205, 0.4, 14), std('#f59e1b', 0.55, 0, { emissive: '#f59e1b', emissiveIntensity: 0.12 }));
      vest.position.y = 1.24; g.add(vest);
      const strip = mk(new THREE.CylinderGeometry(0.209, 0.209, 0.045, 14), std('#e8eef2', 0.3, 0.5)); strip.position.y = 1.18; g.add(strip);
    }
    const arms = [-0.25, 0.25].map((x) => {
      const pivot = new THREE.Group(); pivot.position.set(x, 1.52, 0);
      const arm = mk(new THREE.CylinderGeometry(0.06, 0.055, 0.62, 10), top); arm.position.y = -0.31; pivot.add(arm);
      const hand = mk(new THREE.SphereGeometry(0.06, 10, 8), skin); hand.position.y = -0.64; pivot.add(hand);
      g.add(pivot); return pivot;
    });
    const head = mk(new THREE.SphereGeometry(0.125, 18, 14), skin); head.position.y = 1.79; g.add(head);
    if (!lab) { const hat = mk(new THREE.SphereGeometry(0.145, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#ffffff', 0.35)); hat.position.y = 1.82; g.add(hat); }
    else { const hair = mk(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), std('#2a2420', 0.9)); hair.position.y = 1.81; g.add(hair); }
    const body = [torso, head];
    let walk = 0;
    g.userData.animate = (t, moving, dt) => {
      walk = moving ? walk + dt * 7.5 : walk * Math.exp(-dt * 6);
      const s = moving ? Math.sin(walk) : Math.sin(walk) * 0.2;
      legs[0].rotation.x = s * 0.55; legs[1].rotation.x = -s * 0.55;
      arms[0].rotation.x = -s * 0.45; arms[1].rotation.x = s * 0.45;
      body[0].rotation.z = moving ? Math.sin(walk) * 0.04 : 0;
      g.position.y = moving ? Math.abs(Math.cos(walk)) * 0.035 : 0;
    };
    return g;
  }
  let lastDt = 0.016;
  function walker(kind, a, b, speed = 1.15, pause = 2.5) {
    const p = person(kind); dyn.add(p);
    pingPong(p, a, b, speed, pause, rnd() * 20, (t, moving) => p.userData.animate(t, moving, lastDt));
    return p;
  }

  function forklift(a, b, pause = 2, opts = {}) {
    const g = new THREE.Group();
    B(g, 1.15, 0.95, 1.6, M.orange, 0, 0.28, -0.1, 0.12);
    B(g, 1.15, 0.75, 0.42, M.machineDark, 0, 0.28, -1.0, 0.08);
    [[0.6, 0.45], [-0.6, 0.45], [0.6, -0.65], [-0.6, -0.65]].forEach(([x, z]) => {
      const w = mk(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 18), M.rubber); w.rotation.z = Math.PI / 2; w.position.set(x, 0.28, z); g.add(w);
    });
    [[0.5, 0.45], [-0.5, 0.45], [0.5, -0.65], [-0.5, -0.65]].forEach(([x, z]) => B(g, 0.06, 0.95, 0.06, M.machineDark, x, 1.23, z));
    B(g, 1.1, 0.06, 1.2, M.machineDark, 0, 2.18, -0.1);
    B(g, 0.1, 2.5, 0.12, M.steelDark, 0.38, 0.15, 0.78); B(g, 0.1, 2.5, 0.12, M.steelDark, -0.38, 0.15, 0.78);
    B(g, 0.86, 0.1, 0.1, M.steelDark, 0, 2.5, 0.78);
    B(g, 0.12, 0.05, 1.1, M.steelDark, 0.3, 0.32, 1.38); B(g, 0.12, 0.05, 1.1, M.steelDark, -0.3, 0.32, 1.38);
    if (opts.load !== false) { B(g, 1.2, 0.14, 1.0, M.wood, 0, 0.37, 1.38); B(g, 1.05, 0.85, 0.92, M.kraft, 0, 0.51, 1.38, 0.02); }
    const d = person('worker'); d.scale.setScalar(0.92); d.position.set(0, 0.08, -0.3);
    d.children.slice(0, 2).forEach((leg) => (leg.rotation.x = -1.3));
    g.add(d);
    dyn.add(g);
    if (a) pingPong(g, a, b, 2.2, pause, rnd() * 15);
    return g;
  }

  /* =========================================================
     BUILDING  — hall interior x 0..60, z 0..36
     ========================================================= */
  plane(staticRoot, 700, 700, M.ground, 30, -0.32, 18);
  plane(staticRoot, 34, 32, M.yard, 78, -0.31, 27);                // truck yard
  plane(staticRoot, 40, 9, M.yard, 80, -0.309, 44.5);               // dispatch apron
  plane(staticRoot, 220, 9, M.yard, 210, -0.31, 44.5);              // exit road
  for (let x = 102; x < 320; x += 6) plane(staticRoot, 3, 0.16, M.white, x, -0.305, 44.5);
  for (let z = 14; z <= 42; z += 4) plane(staticRoot, 10, 0.12, M.white, 84, -0.305, z);
  plane(staticRoot, 64, 5, std('#e9ecef', 0.9), 30, -0.31, 40.5);  // front walkway
  B(staticRoot, 61.2, 0.32, 37.2, M.slabSide, 30, -0.32, 18);
  plane(staticRoot, 60, 36, M.floor, 30, 0.004, 18);

  // walls (back + left full height, front + right cut away)
  B(staticRoot, 60.8, 9, 0.4, M.wall, 30, 0, -0.2);
  B(staticRoot, 0.4, 9, 36.4, M.wall, -0.2, 0, 18);
  B(staticRoot, 61.2, 0.22, 0.7, M.coping, 30, 9, -0.2);
  B(staticRoot, 0.7, 0.22, 36.8, M.coping, -0.2, 9, 18);
  B(staticRoot, 60.8, 1.1, 0.4, M.wall, 30, 0, 36.2);
  B(staticRoot, 61.2, 0.12, 0.6, M.coping, 30, 1.1, 36.2);
  [[0, 22.4], [25.6, 28.4], [31.6, 36.4]].forEach(([z0, z1]) => {   // right wall with two dock gaps
    B(staticRoot, 0.4, 1.1, z1 - z0, M.wall, 60.2, 0, (z0 + z1) / 2);
    B(staticRoot, 0.6, 0.12, z1 - z0, M.coping, 60.2, 1.1, (z0 + z1) / 2);
  });
  B(staticRoot, 60.4, 0.6, 0.06, M.red, 30, 7.7, 0.03);           // brand band
  B(staticRoot, 0.06, 0.6, 36, M.red, 0.03, 7.7, 18);
  for (let x = 0; x <= 60; x += 12) B(staticRoot, 0.7, 9.1, 0.7, M.red, Math.min(59.6, Math.max(0.4, x)), 0, 0.2);
  for (let z = 12; z <= 36; z += 12) B(staticRoot, 0.7, 9.1, 0.7, M.red, 0.2, 0, Math.min(35.6, z));
  for (let x = 3; x < 58; x += 4.2) {                                // clerestory windows
    if (x > 19 && x < 41) continue;
    B(staticRoot, 3.4, 1.5, 0.05, M.glassDark, x + 1.7, 5.4, 0.03);
  }
  for (let z = 15; z < 34; z += 4.2) B(staticRoot, 0.05, 1.5, 3.4, M.glassDark, 0.03, 5.4, z + 1.7);
  // logo wall: big decal + brand stripes either side
  decal(staticRoot, 6.4, 30, 4.25, 0.07);
  [['#1e9be0', 5.1], ['#e5322d', 4.5], ['#f59e1b', 3.9]].forEach(([c, y]) => {
    const mat = std(c, 0.5);
    B(staticRoot, 14, 0.36, 0.04, mat, 41.5, y - 0.18, 0.04);
    B(staticRoot, 14, 0.36, 0.04, mat, 18.5, y - 0.18, 0.04);
  });
  decal(staticRoot, 4.4, 0.07, 4.25, 6.5, Math.PI / 2);

  // floor markings: walkways + machine zones
  const line = (x0, z0, x1, z1) => {
    const w = Math.abs(x1 - x0) || 0.12, d = Math.abs(z1 - z0) || 0.12;
    plane(staticRoot, w, d, M.yellowLine, (x0 + x1) / 2, 0.008, (z0 + z1) / 2).userData.noMerge = false;
  };
  line(0.6, 17.3, 59.4, 17.3); line(0.6, 18.7, 59.4, 18.7);
  line(23.3, 0.6, 23.3, 35.4); line(24.7, 0.6, 24.7, 35.4);
  line(42.4, 0.6, 42.4, 17); line(43.6, 0.6, 43.6, 17);
  const zone = (x0, z0, x1, z1) => { line(x0, z0, x1, z0); line(x0, z1, x1, z1); line(x0, z0, x0, z1); line(x1, z0, x1, z1); };

  /* =========================================================
     01 PRINT — two four-colour offset presses
     ========================================================= */
  const anchors = [[], [], [], [], [], []];
  function press(x0, z, phase) {
    zone(x0 - 2.3, z - 2.2, x0 + 14.6, z + 2.9);
    pallet(staticRoot, x0 - 1.4, z, 'paper', 0.85);
    B(staticRoot, 2.2, 2.0, 2.4, M.machine, x0 + 0.6, 0, z, 0.08);
    B(staticRoot, 1.4, 0.06, 1.0, M.paper, x0 + 0.6, 2.0, z);
    contact(x0 + 6, z, 15, 3.2, 0.5);
    const unitX = [];
    for (let i = 0; i < 4; i++) {
      const ux = x0 + 2.7 + i * 2.0; unitX.push(ux);
      B(staticRoot, 1.9, 2.4, 2.6, M.machine, ux, 0, z, 0.07);
      B(staticRoot, 1.6, 0.2, 2.2, M.ink[i], ux, 2.4, z, 0.05);
      B(staticRoot, 1.5, 1.1, 0.04, M.machineDark, ux, 0.7, z + 1.31);
      B(staticRoot, 1.9, 0.14, 0.04, M.blue, ux, 0.12, z + 1.31);
      B(staticRoot, 0.25, 0.25, 0.04, M.ink[i], ux + 0.6, 1.95, z + 1.31);
    }
    B(staticRoot, 3.0, 1.8, 2.6, M.machine, x0 + 11.2, 0, z, 0.08);
    B(staticRoot, 2.6, 0.5, 2.2, M.glassDark, x0 + 11.2, 1.8, z, 0.05);
    pallet(staticRoot, x0 + 13.6, z, 'paper', 0.55);
    B(staticRoot, 0.9, 1.1, 0.55, M.machineDark, x0 + 5.2, 0, z + 2.3, 0.04);   // console
    const scr = plane(staticRoot, 0.75, 0.45, M.screen, x0 + 5.2, 1.25, z + 2.42, -0.9);
    scr.userData.noMerge = true;
    // travelling sheets
    for (let k = 0; k < 4; k++) {
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.8), artMat[0]);
      sh.rotation.x = -Math.PI / 2; sh.castShadow = true; dyn.add(sh);
      anims.push((t) => {
        const u = ((t / 7 + phase + k / 4) % 1 + 1) % 1;
        let x, y;
        if (u < 0.1) { x = lerp(x0 + 0.6, x0 + 1.9, u / 0.1); y = lerp(2.08, 2.68, u / 0.1); }
        else if (u < 0.74) { x = lerp(x0 + 1.9, x0 + 10, (u - 0.1) / 0.64); y = 2.68; }
        else if (u < 0.86) { x = lerp(x0 + 10, x0 + 11.2, (u - 0.74) / 0.12); y = lerp(2.68, 2.38, (u - 0.74) / 0.12); }
        else { x = lerp(x0 + 11.2, x0 + 13.6, (u - 0.86) / 0.14); y = lerp(2.38, 0.74, smooth((u - 0.86) / 0.14)); }
        sh.position.set(x, y, z);
        sh.visible = u < 0.985;
        sh.material = artMat[unitX.filter((ux) => x > ux).length];
      });
    }
    return unitX;
  }
  const p1 = press(4.5, 6, 0);
  press(4.5, 12.6, 0.37);
  anchors[0].push(new THREE.Vector3(p1[1] + 1, 2.9, 6), new THREE.Vector3(15.7, 2.6, 12.6));
  walker('worker', [6, 9.3], [16, 9.3], 1.1, 3);
  walker('worker', [9.7, 15.6], [9.7, 15.6 + 0.01], 1, 999);
  walker('worker', [19.5, 4], [19.5, 15], 1.2, 2);

  /* =========================================================
     02 LAMINATE — board rolls, unwind, laminator, conveyor
     ========================================================= */
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
    const x = 26.6 + j * 1.45, z = 2.4 + i * 1.5;
    const r = mk(new THREE.CylinderGeometry(0.64, 0.64, 1.3, 32), M.roll); r.position.set(x, 0.65, z); dyn.add(r);
    if ((i + j) % 3 === 0) { const r2 = r.clone(); r2.position.y = 1.95; dyn.add(r2); }
  }
  contact(28.8, 3.9, 6, 4.6, 0.45);
  zone(25.6, 8.6, 42, 14.2);
  B(staticRoot, 0.25, 1.9, 0.25, M.steelDark, 30.8, 0, 9.85); B(staticRoot, 0.25, 1.9, 0.25, M.steelDark, 30.8, 0, 12.15);
  const unwind = new THREE.Group(); unwind.position.set(30.8, 1.25, 11); dyn.add(unwind);
  const ur = mk(new THREE.CylinderGeometry(0.85, 0.85, 2.0, 40), M.roll); ur.rotation.x = Math.PI / 2; unwind.add(ur);
  B(staticRoot, 2.6, 0.03, 1.8, std('#c69a6b', 0.85), 32.6, 2.05, 11);
  B(staticRoot, 3.6, 2.5, 2.8, M.machine, 35.4, 0, 11, 0.08);
  B(staticRoot, 3.2, 0.16, 2.4, M.blue, 35.4, 2.5, 11, 0.05);
  B(staticRoot, 3.0, 1.2, 0.04, M.machineDark, 35.4, 0.7, 12.41);
  const rollers = [];
  for (let i = 0; i < 3; i++) {
    const rg = new THREE.Group(); rg.position.set(34.4 + i * 1.0, 2.8, 11); dyn.add(rg);
    const rr = mk(new THREE.CylinderGeometry(0.16, 0.16, 2.3, 20), M.steel); rr.rotation.x = Math.PI / 2; rg.add(rr); rollers.push(rg);
  }
  B(staticRoot, 4.4, 0.85, 1.7, M.rubber, 39.4, 0, 11);
  B(staticRoot, 4.4, 0.1, 0.07, M.steel, 39.4, 0.85, 10.15); B(staticRoot, 4.4, 0.1, 0.07, M.steel, 39.4, 0.85, 11.85);
  contact(37, 11, 10, 3.2, 0.5);
  const lamSheets = [];
  for (let k = 0; k < 4; k++) {
    const s = mk(new THREE.BoxGeometry(1.0, 0.035, 1.35), k % 2 ? M.kraft : artMat[4]); dyn.add(s); lamSheets.push(s);
  }
  anims.push((t, dt) => {
    unwind.rotation.z -= dt * 0.9;
    rollers.forEach((r, i) => (r.rotation.z += dt * (i % 2 ? 3 : -3)));
    lamSheets.forEach((s, k) => { s.position.set(37.4 + ((t * 0.7 + k * 1.1) % 4.4), 0.87, 11); s.visible = s.position.x < 41.4; });
  });
  pallet(staticRoot, 40.4, 13.4, 'kraft', 0.9);
  pallet(staticRoot, 38.9, 13.4, 'kraft', 0.6);
  anchors[1].push(new THREE.Vector3(35.4, 3.2, 11), new THREE.Vector3(28.8, 2.7, 3.9));
  walker('worker', [33, 13.6], [38, 13.6], 1.0, 3.5);
  walker('worker', [26, 7.6], [31, 7.6], 1.1, 2.5);

  /* =========================================================
     03 CONVERT — two die-cutting presses
     ========================================================= */
  function dieCutter(x0, z, phase) {
    zone(x0 - 1.8, z - 2.2, x0 + 8, z + 2.9);
    pallet(staticRoot, x0 - 0.9, z, 'paper', 0.7);
    B(staticRoot, 1.8, 1.6, 2.2, M.machine, x0 + 0.9, 0, z, 0.06);
    B(staticRoot, 3.2, 1.4, 2.8, M.machine, x0 + 3.5, 0, z, 0.08);
    [[-1.35, -1.15], [1.35, -1.15], [-1.35, 1.15], [1.35, 1.15]].forEach(([dx, dz]) =>
      C(staticRoot, 0.13, 0.13, 2.4, M.steel, x0 + 3.5 + dx, 1.4, z + dz, 16));
    B(staticRoot, 3.2, 0.6, 2.8, M.machine, x0 + 3.5, 3.8, z, 0.08);
    B(staticRoot, 3.2, 0.14, 0.04, M.red, x0 + 3.5, 4.05, z + 1.41);
    B(staticRoot, 1.6, 0.9, 2.2, M.machine, x0 + 6.3, 0, z, 0.06);
    B(staticRoot, 1.0, 0.8, 0.8, M.tank, x0 + 5.8, 0, z + 2.0, 0.04);
    contact(x0 + 3.2, z, 9, 3.2, 0.5);
    const platen = mk(geoBox(2.8, 0.35, 2.4, 0.05), M.red); dyn.add(platen);
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.8), artMat[4]); sheet.rotation.x = -Math.PI / 2; sheet.castShadow = true; dyn.add(sheet);
    const stack = mk(new THREE.BoxGeometry(1.1, 1, 0.8), cartonMats); dyn.add(stack);
    anims.push((t) => {
      const u = ((t / 2.6 + phase) % 1 + 1) % 1;
      const down = smooth(seg(u, 0.35, 0.5)) - smooth(seg(u, 0.55, 0.72));
      const py = lerp(3.45, 1.47, down); platen.position.set(x0 + 3.5, py + 0.175, z);
      let sx, sy;
      if (u < 0.35) { sx = lerp(x0 + 0.9, x0 + 3.5, smooth(u / 0.35)); sy = lerp(1.62, 1.43, u / 0.35); }
      else if (u < 0.72) { sx = x0 + 3.5; sy = 1.43; }
      else { sx = lerp(x0 + 3.5, x0 + 6.3, smooth(seg(u, 0.72, 1))); sy = lerp(1.43, 1.0 + stackH(t), seg(u, 0.72, 1)); }
      sheet.position.set(sx, sy, z); sheet.visible = u < 0.97;
      const h = stackH(t); stack.scale.y = h; stack.position.set(x0 + 6.3, 0.9 + h / 2, z);
    });
    const stackH = (t) => 0.06 + (((t / 40 + phase) % 1) * 0.4);
    return x0;
  }
  dieCutter(45.2, 6, 0);
  dieCutter(45.2, 12.6, 0.45);
  anchors[2].push(new THREE.Vector3(48.7, 3.8, 6), new THREE.Vector3(51.5, 1.6, 12.6));
  walker('worker', [44, 9.4], [53, 9.4], 1.15, 2.5);
  walker('worker', [55.5, 4.5], [55.5, 15.5], 1.0, 3);

  /* =========================================================
     04 FINISH — folder-gluer, pallet racking, dispatch, trucks
     ========================================================= */
  zone(26.2, 29.9, 48, 33.2);
  B(staticRoot, 1.6, 1.3, 1.8, M.machine, 27.8, 0, 31.5, 0.06);
  B(staticRoot, 1.1, 0.4, 0.8, M.paper, 27.8, 1.3, 31.5);
  B(staticRoot, 16, 0.75, 1.2, M.rubber, 36.6, 0, 31.5);
  B(staticRoot, 16, 0.1, 0.06, M.steel, 36.6, 0.75, 29.93); B(staticRoot, 16, 0.1, 0.06, M.steel, 36.6, 0.75, 31.07);
  B(staticRoot, 2.2, 1.5, 1.6, M.machine, 31.5, 0.3, 31.5, 0.08);
  B(staticRoot, 1.2, 1.4, 1.6, M.machine, 35.4, 0.3, 31.5, 0.08); B(staticRoot, 1.0, 0.12, 1.4, M.orange, 35.4, 1.7, 31.5, 0.04);
  B(staticRoot, 3.0, 1.3, 1.6, M.machine, 40.6, 0.3, 31.5, 0.08); B(staticRoot, 2.8, 0.12, 1.4, M.blue, 40.6, 1.6, 31.5, 0.04);
  contact(36.6, 31.5, 18, 2, 0.5);
  const cartons = [];
  for (let k = 0; k < 14; k++) { const c = mk(new THREE.BoxGeometry(0.55, 0.07, 0.75), cartonMats); dyn.add(c); cartons.push(c); }
  anims.push((t) => cartons.forEach((c, k) => { c.position.set(28.7 + ((t * 1.1 + k * 1.15) % 15.8), 0.79, 31.5); }));
  B(staticRoot, 1.6, 0.9, 1.2, M.steel, 46.2, 0, 31.5, 0.03);
  for (let i = 0; i < 4; i++) B(staticRoot, 0.5, 0.35, 0.4, M.kraft, 45.7 + (i % 2) * 0.55, 0.9 + Math.floor(i / 2) * 0.35, 31.4, 0.02);
  anchors[3].push(new THREE.Vector3(35.4, 2.2, 31.5), new THREE.Vector3(46.2, 1.9, 31.5));

  function rackRow(x0, z, bays) {
    for (let b = 0; b <= bays; b++) {
      const x = x0 + b * 2.75;
      B(staticRoot, 0.1, 5.8, 0.1, M.rackBlue, x, 0, z - 0.55); B(staticRoot, 0.1, 5.8, 0.1, M.rackBlue, x, 0, z + 0.55);
    }
    for (let b = 0; b < bays; b++) {
      const cx = x0 + b * 2.75 + 1.375;
      [1.95, 3.85].forEach((y) => { B(staticRoot, 2.65, 0.14, 0.08, M.rackOrange, cx, y, z - 0.55); B(staticRoot, 2.65, 0.14, 0.08, M.rackOrange, cx, y, z + 0.55); });
      [0, 2.09, 3.99].forEach((y) => [-0.65, 0.65].forEach((dx) => {
        if (rnd() < 0.14) return;
        B(staticRoot, 1.2, 0.14, 1.0, M.wood, cx + dx, y, z);
        B(staticRoot, 1.1, 0.8 + rnd() * 0.75, 0.95, M.kraft, cx + dx, y + 0.14, z, 0.02);
      }));
    }
    contact(x0 + (bays * 2.75) / 2, z, bays * 2.75, 1.4, 0.45);
  }
  rackRow(27, 22.4, 7); rackRow(27, 26.6, 7);
  forklift([29, 29.0], [52.5, 29.0], 2.5);
  forklift([50.5, 34.4], [57.5, 30.3], 3);
  for (let i = 0; i < 6; i++) pallet(staticRoot, 54 + (i % 3) * 1.6, 21 + Math.floor(i / 3) * 1.4, 'kraft', 0.8 + rnd() * 0.5);
  walker('worker', [47.6, 28.4], [47.6, 28.4 + 0.01], 1, 999);
  walker('worker', [48, 27.5], [57, 27.5], 1.2, 2);

  function truck(z) {
    B(staticRoot, 11.6, 0.3, 1.0, M.rubber, 67.4, 0.8, z);
    B(staticRoot, 12, 3.2, 2.5, std('#f5f6f7', 0.45, 0.1), 67.6, 1.1, z, 0.1);
    decal(staticRoot, 2.5, 65.2, 2.75, z + 1.27);
    [['#1e9be0', 2.55], ['#e5322d', 2.25], ['#f59e1b', 1.95]].forEach(([c, y]) =>
      B(staticRoot, 6.2, 0.18, 0.02, std(c, 0.5), 70.2, y, z + 1.26));
    B(staticRoot, 2.5, 2.4, 2.4, M.blue, 75.2, 1.0, z, 0.18);
    B(staticRoot, 0.05, 1.0, 2.0, M.glassDark, 76.47, 2.1, z);
    decal(staticRoot, 0.85, 75.2, 2.15, z + 1.22);
    B(staticRoot, 2.6, 0.5, 2.3, M.machineDark, 75.2, 0.6, z, 0.05);
    [62.4, 63.8, 74.4, 76.0].forEach((x) => [z - 1.05, z + 1.05].forEach((wz) => {
      const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 22), M.rubber); w.rotation.x = Math.PI / 2; w.position.set(x, 0.18, wz); staticRoot.add(w);
    }));
    contact(69, z, 15, 2.8, 0.55);
  }
  truck(24); truck(30);
  B(staticRoot, 0.1, 3.4, 3.0, M.rubber, 60.45, 0, 24); B(staticRoot, 0.1, 3.4, 3.0, M.rubber, 60.45, 0, 30);

  /* =========================================================
     05 QUALITY — glass-walled lab + water treatment
     ========================================================= */
  plane(staticRoot, 19.6, 15.2, M.labFloor, 10, 0.006, 28.2);
  for (let x = 0.4; x < 20; x += 2.4) B(staticRoot, 2.35, 2.6, 0.04, M.glass, x + 1.2, 0, 20.6);
  for (let z = 20.6; z < 35.6; z += 2.4) if (z < 26.5 || z > 29) B(staticRoot, 0.04, 2.6, 2.35, M.glass, 20, 0, z + 1.2);
  for (let x = 0.4; x <= 20; x += 2.4) B(staticRoot, 0.08, 2.7, 0.08, M.steel, x, 0, 20.6);
  for (let z = 20.6; z <= 35.6; z += 2.4) B(staticRoot, 0.08, 2.7, 0.08, M.steel, 20, 0, z);
  B(staticRoot, 19.6, 0.08, 0.1, M.steel, 10.2, 2.62, 20.6); B(staticRoot, 0.1, 0.08, 15, M.steel, 20, 2.62, 28.1);
  [23.4, 27, 30.6].forEach((z, bi) => {
    [[4.2, z - 0.45], [11.2, z - 0.45], [4.2, z + 0.45], [11.2, z + 0.45]].forEach(([x, zz]) => B(staticRoot, 0.07, 0.9, 0.07, M.steel, x, 0, zz));
    B(staticRoot, 7.4, 0.08, 1.15, M.white, 7.7, 0.9, z, 0.02);
    B(staticRoot, 7.0, 0.04, 0.9, M.steel, 7.7, 0.25, z);
    B(staticRoot, 0.08, 0.32, 0.08, M.machineDark, 5 + bi, 0.98, z - 0.3);
    const m = mk(new THREE.BoxGeometry(0.7, 0.42, 0.04), [M.machineDark, M.machineDark, M.machineDark, M.machineDark, M.screen, M.machineDark]);
    m.position.set(5 + bi, 1.45, z - 0.3); staticRoot.add(m); m.userData.noMerge = true;
    B(staticRoot, 0.55, 0.3, 0.45, M.machine, 7, 0.98, z, 0.03);
    C(staticRoot, 0.09, 0.12, 0.45, M.machineDark, 8.2, 0.98, z - 0.1, 14);
    for (let i = 0; i < 3; i++) { const c = mk(new THREE.BoxGeometry(0.35, 0.28, 0.3), cartonMats); c.position.set(9.4 + i * 0.5, 1.12, z + 0.1); staticRoot.add(c); c.userData.noMerge = true; }
    contact(7.7, z, 7.6, 1.4, 0.35);
  });
  B(staticRoot, 1.4, 0.8, 1.0, M.machine, 15.2, 0, 24.2, 0.05);
  C(staticRoot, 0.07, 0.07, 2.0, M.steel, 14.65, 0.8, 24.2, 12); C(staticRoot, 0.07, 0.07, 2.0, M.steel, 15.75, 0.8, 24.2, 12);
  B(staticRoot, 1.5, 0.3, 1.0, M.blue, 15.2, 2.8, 24.2, 0.05);
  const head = mk(geoBox(1.25, 0.18, 0.8, 0.03), M.steel); dyn.add(head);
  const sample = mk(new THREE.BoxGeometry(0.6, 0.5, 0.5), cartonMats); dyn.add(sample);
  anims.push((t) => {
    const u = (t / 4.5) % 1, d = smooth(seg(u, 0.1, 0.45)) - smooth(seg(u, 0.6, 0.85));
    head.position.set(15.2, lerp(2.5, 1.39, d), 24.2);
    const sq = 1 - Math.max(0, d - 0.85) * 0.5; sample.scale.y = sq; sample.position.set(15.2, 0.8 + (0.5 * sq) / 2, 24.2);
  });
  contact(15.2, 24.2, 1.6, 1.2, 0.5);
  B(staticRoot, 1.4, 2.2, 1.1, M.white, 16.6, 0, 31.4, 0.06);
  B(staticRoot, 0.7, 0.9, 0.03, M.screen, 16.6, 0.9, 31.97);
  contact(16.6, 31.4, 1.5, 1.2, 0.5);
  anchors[4].push(new THREE.Vector3(15.2, 3.2, 24.2));
  walker('lab', [4.5, 25.2], [11, 25.2], 0.9, 4);
  walker('lab', [13, 29], [13, 33.5], 0.9, 5);
  walker('lab', [10, 32.2], [10, 32.2 + 0.01], 1, 999);

  // water treatment plant (outside, front-left)
  [3.2, 6.6].forEach((x) => { C(staticRoot, 1.25, 1.25, 3.2, M.tank, x, -0.3, 40.2, 36); C(staticRoot, 1.3, 1.3, 0.1, M.steel, x, 2.9, 40.2, 36); contact(x, 40.2, 2.6, 2.6); });
  B(staticRoot, 3.6, 0.18, 0.18, M.steel, 4.9, 1.6, 40.2);
  B(staticRoot, 1.6, 1.4, 1.2, M.machine, 9.6, -0.3, 40.2, 0.05);
  anchors[4].push(new THREE.Vector3(4.9, 3.2, 40.2));


  /* =========================================================
     06 DELIVER — forklift loads a curtain-side truck, which
     then drives off. Scrubbed by scroll (dispatchP 0..1).
     ========================================================= */
  const scrubbers = [];
  const TZ = 41.5, deckY = 1.32;
  const truckG = new THREE.Group(); dyn.add(truckG);
  B(truckG, 13, 0.35, 1.0, M.rubber, 70.5, 0.85, TZ);
  B(truckG, 13, 0.12, 2.5, M.steelDark, 70.5, 1.2, TZ);
  B(truckG, 0.12, 2.75, 2.5, std('#f5f6f7', 0.45, 0.1), 76.94, deckY, TZ);
  B(truckG, 13, 0.1, 2.56, std('#f5f6f7', 0.45, 0.1), 70.5, deckY + 2.68, TZ);
  B(truckG, 0.12, 2.68, 0.12, M.steelDark, 64.06, deckY, TZ - 1.2); B(truckG, 0.12, 2.68, 0.12, M.steelDark, 64.06, deckY, TZ + 1.2);
  B(truckG, 0.1, 2.68, 2.5, std('#eceff1', 0.5), 64.05, deckY, TZ);                       // rear doors
  const curtainTex = canvasTex(1024, 220, (g, w, h) => {
    g.fillStyle = '#f7f8f9'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 24) { g.fillStyle = 'rgba(0,0,0,.035)'; g.fillRect(x, 0, 10, h); }     // pleats
    [['#1e9be0', 150], ['#e5322d', 172], ['#f59e1b', 194]].forEach(([c, y]) => { g.fillStyle = c; g.fillRect(0, y, w, 14); });
    g.drawImage(logoImg, 36, 8, 132, 132);
  });
  const farCurtain = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.68), std('#eef0f2', 0.7, 0, { side: THREE.DoubleSide }));
  farCurtain.position.set(70.5, deckY + 1.34, TZ - 1.25); truckG.add(farCurtain);
  const curtainPivot = new THREE.Group(); curtainPivot.position.set(76.9, deckY + 1.34, TZ + 1.27); truckG.add(curtainPivot);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(12.9, 2.68), std('#ffffff', 0.7, 0, { map: curtainTex, side: THREE.DoubleSide }));
  curtain.position.x = -6.45; curtain.castShadow = true; curtainPivot.add(curtain);
  B(truckG, 2.6, 2.5, 2.5, M.blue, 78.55, 1.0, TZ, 0.18);
  B(truckG, 0.05, 1.0, 2.0, M.glassDark, 79.87, 2.1, TZ);
  B(truckG, 2.8, 0.5, 2.3, M.machineDark, 78.6, 0.6, TZ, 0.05);
  decal(truckG, 0.85, 78.4, 2.15, TZ + 1.27);
  const wheels = [];
  [65.2, 66.5, 67.8, 77.7, 79.2].forEach((x) => [TZ - 1.05, TZ + 1.05].forEach((wz) => {
    const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 22), M.rubber); w.rotation.x = Math.PI / 2; w.position.set(x, 0.18, wz); truckG.add(w); wheels.push(w);
  }));
  const truckShadow = new THREE.Mesh(new THREE.PlaneGeometry(22, 4.6), M.contact); truckShadow.rotation.x = -Math.PI / 2; truckShadow.position.set(72, -0.29, TZ); truckG.add(truckShadow);

  const SLOTS = [0, 1, 2, 3, 4, 5].map((k) => 75.4 - k * 2.05);
  const cargo = SLOTS.map(() => {
    const g = new THREE.Group();
    B(g, 1.2, 0.14, 1.0, M.wood, 0, 0, 0); B(g, 1.1, 1.0, 0.95, M.kraft, 0, 0.14, 0, 0.02);
    dyn.add(g); return g;
  });
  const lift = forklift(null, null, 0, { load: false });
  walker('worker', [62.2, 36.8], [62.2, 36.81], 1, 999);
  anchors[5].push(new THREE.Vector3(70.5, 4.6, TZ), new THREE.Vector3(78.6, 3.9, TZ));
  const cabAnchor = anchors[5][1];
  let dispatchP = 0;
  const forkPt = new THREE.Vector3();
  scrubbers.push((dt) => {
    const d = dispatchP;
    const L = seg(d, 0, 0.62) * 6, cur = Math.min(6, Math.floor(L)), c = L - cur;
    const close = smooth(seg(d, 0.64, 0.74));
    const drive = seg(d, 0.76, 1), tx = Math.pow(drive, 1.8) * 70;
    // forklift: drive forward loaded, place, reverse to the next pallet
    const A = (k) => [SLOTS[Math.min(5, k)], 33.2], Bp = (k) => [SLOTS[Math.min(5, k)], 38.4];
    let fx, fz, liftY = 0.32, carrying = -1, placing = 0;
    if (cur >= 6) { [fx, fz] = A(6); fx -= 2.4; }
    else if (c < 0.45) { const u = smooth(c / 0.45); fx = SLOTS[cur]; fz = lerp(33.2, 38.4, u); liftY = lerp(0.32, deckY + 0.08, seg(c, 0.2, 0.45)); carrying = cur; }
    else if (c < 0.58) { [fx, fz] = Bp(cur); liftY = deckY + 0.08; carrying = cur; placing = seg(c, 0.45, 0.58); }
    else { const u = smooth(seg(c, 0.58, 1)); fx = lerp(SLOTS[cur], SLOTS[Math.min(5, cur + 1)], u); fz = lerp(38.4, 33.2, u); liftY = lerp(deckY + 0.08, 0.32, u); }
    lift.position.set(fx, 0, fz); lift.rotation.y = 0;
    cargo.forEach((g, k) => {
      if (k < cur || (k === cur && c >= 0.58)) g.position.set(SLOTS[k] + tx, deckY, TZ);              // on the truck
      else if (k === carrying) {
        forkPt.set(fx, liftY, fz + 1.38);
        g.position.set(fx, liftY, lerp(forkPt.z, TZ, smooth(placing)));
      } else g.position.set(SLOTS[k], 0, 34.6);                                                        // staged
    });
    curtainPivot.scale.x = lerp(0.04, 1, close);
    truckG.position.x = tx;
    wheels.forEach((w) => (w.rotation.y = -tx / 0.5));
    cabAnchor.x = 78.6 + tx; anchors[5][0].x = 70.5 + tx;
    STATIONS[5].t.x = 71 + tx * 0.95;
    STATIONS[5].t.z = 38.5 + Math.min(1, tx / 20) * 3;
    STATIONS[5].d = 44 + tx * 0.22;
  });

  /* ---------- surroundings: trees, cars, lamps ---------- */
  const treeSpots = [];
  const ok = (x, z) => !(z > 30 && z < 51 && x > 58) && !(x > -3 && x < 63 && z > -3 && z < 37.5) && !(z > 36 && x > -8 && x < 100) && !(x > 60 && x < 95 && z > 10 && z < 44) && !(z > 38 && z < 43.5 && x > -2 && x < 62) && treeSpots.every(([a, b]) => (a - x) ** 2 + (b - z) ** 2 > 16);
  for (let i = 0; i < 900 && treeSpots.length < 70; i++) {
    const x = -30 + rnd() * 130, z = -22 + rnd() * 80;
    if (ok(x, z)) treeSpots.push([x, z]);
  }
  const ico = new THREE.IcosahedronGeometry(1, 0);
  treeSpots.forEach(([x, z]) => {
    const s = 1.1 + rnd() * 1.1;
    C(staticRoot, 0.11 * s, 0.16 * s, 1.7 * s, M.trunk, x, -0.3, z, 8);
    const c = mk(ico, M.tree[Math.floor(rnd() * 3)]); c.scale.set(1.25 * s, 1.6 * s, 1.25 * s);
    c.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); c.position.set(x, -0.3 + 2.6 * s, z); staticRoot.add(c);
  });
  const carCols = ['#f4f5f6', '#b9c0c7', '#1e9be0', '#2b3138', '#e5322d', '#f4f5f6', '#8e979f'];
  carCols.forEach((col, i) => {
    const x = 14 + i * 3.4, z = 46.5;
    B(staticRoot, 1.9, 0.75, 4.3, std(col, 0.3, 0.4), x, -0.05, z, 0.25);
    B(staticRoot, 1.7, 0.55, 2.3, M.glassDark, x, 0.68, z + 0.2, 0.2);
    [[0.85, 1.4], [-0.85, 1.4], [0.85, -1.4], [-0.85, -1.4]].forEach(([dx, dz]) => {
      const w = mk(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 16), M.rubber); w.rotation.z = Math.PI / 2; w.position.set(x + dx, 0.06, z + dz); staticRoot.add(w);
    });
    plane(staticRoot, 0.1, 5, M.white, x + 1.7, -0.3, z);
    contact(x, z, 2.2, 4.6, 0.45);
  });
  for (let x = 2; x <= 58; x += 14) { C(staticRoot, 0.08, 0.1, 6, M.steelDark, x, -0.3, 43.2, 10); B(staticRoot, 0.3, 0.15, 1.1, M.steelDark, x, 5.6, 42.8); }

  /* ---------- merge static meshes by material (perf) ---------- */
  staticRoot.updateMatrixWorld(true);
  const groups = new Map(), keep = [];
  staticRoot.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.noMerge || Array.isArray(o.material) || o.material.transparent) { keep.push(o); return; }
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
    const ng = g.index ? g.toNonIndexed() : g;
    ['position', 'normal', 'uv'].forEach((a) => { if (!ng.getAttribute(a)) ng.setAttribute(a, new THREE.Float32BufferAttribute(new Float32Array(ng.getAttribute('position').count * (a === 'uv' ? 2 : 3)), a === 'uv' ? 2 : 3)); });
    Object.keys(ng.attributes).forEach((a) => { if (!['position', 'normal', 'uv'].includes(a)) ng.deleteAttribute(a); });
    if (!groups.has(o.material)) groups.set(o.material, { geos: [], cast: o.castShadow });
    groups.get(o.material).geos.push(ng);
  });
  const merged = new THREE.Group();
  groups.forEach(({ geos, cast }, mat) => {
    const geo = mergeGeometries(geos, false);
    if (!geo) return;
    const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; merged.add(m);
  });
  keep.forEach((o) => { o.updateMatrixWorld(true); o.matrixWorld.decompose(o.position, o.quaternion, o.scale); merged.add(o); });
  scene.remove(staticRoot); scene.add(merged);
  // ground/floor planes don't need to cast
  merged.traverse((o) => { if (o.isMesh && (o.material === M.ground || o.material === M.floor || o.material === M.yard || o.material === M.labFloor)) o.castShadow = false; });

  /* =========================================================
     CAMERA — scroll flies between stations
     ========================================================= */
  const VIEW_DIR = new THREE.Vector3(0.66, 0.8, 1.0).normalize();
  const STATIONS = [
    { t: [12.4, 1.2, 9.6], d: 42 },
    { t: [34.4, 1.2, 8.8], d: 35 },
    { t: [50.2, 1.4, 9.6], d: 34 },
    { t: [47, 1.2, 28.5], d: 50 },
    { t: [11.5, 1.0, 30], d: 38 },
    { t: [71, 1.4, 38.5], d: 44 },
  ].map((s) => ({ t: new THREE.Vector3(...s.t), d: s.d }));
  const OVERVIEW = { t: new THREE.Vector3(36, 0, 20), d: 125 };
  const curT = OVERVIEW.t.clone(), curD = { v: OVERVIEW.d };
  const want = { t: new THREE.Vector3(), d: 0 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  const slidesEls = [...hero.querySelectorAll('.hs__slide')];
  const hotspotEls = slidesEls.map((s) => [...s.querySelectorAll('.hotspot')]);
  const N = STATIONS.length;

  function progress() {
    const r = hero.getBoundingClientRect();
    const range = Math.max(1, hero.offsetHeight - innerHeight);
    return clamp(-r.top / range) * N;
  }
  // Spring-smoothed scroll: a touchpad fling glides through stages instead of snapping.
  let sp = null, sv = 0;
  const MAX_SPEED = 1.35;                       // stages per second
  function smoothProgress(dt, snap) {
    const target = progress();
    if (sp === null || snap) { sp = target; sv = 0; return sp; }
    const k = 14, damp = 2 * Math.sqrt(k);
    sv += ((target - sp) * k - sv * damp) * dt;
    sv = clamp(sv, -MAX_SPEED, MAX_SPEED);
    sp += sv * dt;
    if (Math.abs(target - sp) < 1e-4 && Math.abs(sv) < 1e-3) { sp = target; sv = 0; }
    return sp;
  }
  function desired() {
    const s = clamp(sp - 0.5, 0, N - 1);
    const i = Math.min(N - 2, Math.floor(s)), f = smooth(smooth(clamp(s - i)));
    want.t.lerpVectors(STATIONS[i].t, STATIONS[i + 1].t, f);
    want.d = lerp(STATIONS[i].d, STATIONS[i + 1].d, f);
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    if (aspect < 1) want.d *= 1 + (1 / aspect - 1) * 0.55;
    // gentle "breathing" mid-transition so the camera arcs instead of sliding
    const arc = Math.sin(clamp(s - i) * Math.PI) * (i === N - 2 ? 0.1 : 0.16);
    want.d *= 1 + arc;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    camera.aspect = w / h;
    if (isSmall()) camera.setViewOffset(w, h, 0, h * 0.2, w, h);       // scene above the card
    else camera.setViewOffset(w, h, -w * 0.17, 0, w, h);               // scene right of the card
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const tmp = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  function placeCamera(dt, snap) {
    desired();
    const k = snap ? 1 : 1 - Math.exp(-dt * 2.6);
    curT.lerp(want.t, k); curD.v = lerp(curD.v, want.d, k);
    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.exp(-dt * 3)); pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.exp(-dt * 3));
    right.crossVectors(up, VIEW_DIR).normalize();
    tmp.copy(VIEW_DIR).multiplyScalar(curD.v).add(curT)
      .addScaledVector(right, -pointer.sx * curD.v * 0.05).addScaledVector(up, pointer.sy * curD.v * 0.03);
    camera.position.copy(tmp);
    camera.lookAt(curT);
    sun.position.copy(curT).add(SUN_OFFSET);
    sun.target.position.copy(curT);
  }

  function updateHotspots() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    anchors.forEach((list, i) => list.forEach((v, j) => {
      const el = hotspotEls[i] && hotspotEls[i][j];
      if (!el) return;
      tmp.copy(v).project(camera);
      const vis = tmp.z < 1 && tmp.x > -0.95 && tmp.x < 0.95 && tmp.y > -0.9 && tmp.y < 0.9;
      el.style.setProperty('--x', ((tmp.x + 1) / 2 * 100).toFixed(2) + '%');
      el.style.setProperty('--y', ((1 - tmp.y) / 2 * 100).toFixed(2) + '%');
      el.style.visibility = vis ? '' : 'hidden';
    }));
    hotspotEls.forEach((list, i) => list.slice(anchors[i].length).forEach((el) => (el.style.visibility = 'hidden')));
  }

  /* ---------- loop ---------- */
  let running = false, visible = true, t = 0, last = performance.now(), firstFrame = true;
  let lastSent = -1;
  function tick(dt) {
    lastDt = dt;
    smoothProgress(dt, reduceMotion);
    if (Math.abs(sp - lastSent) > 1e-4) { lastSent = sp; hero.dispatchEvent(new CustomEvent('hs:smooth', { detail: sp })); }
    dispatchP = seg(sp, 5.05, 5.97);
    scrubbers.forEach((fn) => fn(dt));
    if (!reduceMotion) { t += dt; anims.forEach((fn) => fn(t, dt)); }
    placeCamera(dt, reduceMotion);
    if (composer) composer.render(); else renderer.render(scene, camera);
    updateHotspots();
    if (firstFrame) { firstFrame = false; hero.classList.add('has-3d'); }
  }
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = clamp((now - last) / 1000, 0, 0.05); last = Math.max(last, now);
    tick(dt);
  }
  function setRunning(v) {
    if (v === running) return;
    running = v;
    if (v) { last = performance.now(); requestAnimationFrame(frame); }
  }
  if (reduceMotion) anims.forEach((fn) => fn(3, 0.016));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(hero);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setRunning(false); hero.classList.remove('has-3d'); });
  setRunning(true);
  // Test hook: /?debug3d exposes a manual stepper (headless browsers throttle rAF)
  if (/[?&]debug3d\b/.test(location.search)) window.__nasrpac3d = { step: (n = 1, dt = 1 / 30) => { for (let i = 0; i < n; i++) tick(dt); } };
}
