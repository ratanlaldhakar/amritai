/*
=========================================
AMRIT YOGA CENTER - 3D WEBGL GRAPHICS V2
=========================================
*/

// Global variables for both scenes
let sceneBg, cameraBg, rendererBg;
let sceneHero, cameraHero, rendererHero;
let bgParticles, lotusPetals = [];
let chakraGroup, medalsGroup, mandalaGroup;
let goldMedal, silverMedal;
let goldMat, silverMat, goldGlassMat;

const colors = {
  saffron: 0xff9933,
  gold: 0xd4af37,
  silver: 0xc5c6c7,
  white: 0xffffff,
  // 7 Chakras Colors
  chakras: [
    0xff0000, // 1. Root (Red)
    0xff7f00, // 2. Sacral (Orange)
    0xffd700, // 3. Solar Plexus (Yellow)
    0x00ff00, // 4. Heart (Green)
    0x00ffff, // 5. Throat (Cyan)
    0x4b0082, // 6. Third Eye (Indigo)
    0x9400d3  // 7. Crown (Violet)
  ]
};

// Target theme colors for smooth interpolation
let targetBgColor = new THREE.Color(0x05060a); // Default dark
let currentBgColor = new THREE.Color(0x05060a);

// Mouse tracking
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Scroll tracking for depth parallax
let scrollY = 0;
let targetScrollY = 0;

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX - windowHalfX) / windowHalfX;
  targetMouseY = (e.clientY - windowHalfY) / windowHalfY;
});

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
});

// Initialization
window.addEventListener('load', () => {
  initBackgroundScene();
  initHeroScene();
  // Sync the 3D scene elements with the current page theme immediately after loading
  const isLight = document.body.classList.contains('light-theme');
  if (window.updateThreeTheme) {
    window.updateThreeTheme(isLight);
  }
  animate();
});

// Window resize handler
window.addEventListener('resize', () => {
  // Update BG camera
  cameraBg.aspect = window.innerWidth / window.innerHeight;
  cameraBg.updateProjectionMatrix();
  rendererBg.setSize(window.innerWidth, window.innerHeight);
  
  // Update Hero camera
  const heroContainer = document.getElementById('hero-3d-canvas');
  if (heroContainer) {
    const width = heroContainer.clientWidth;
    const height = heroContainer.clientHeight;
    cameraHero.aspect = width / height;
    cameraHero.updateProjectionMatrix();
    rendererHero.setSize(width, height);
  }
});

/* 
=========================================
1. BACKGROUND 3D SCENE (Lotus Petals & Dust)
=========================================
*/
function initBackgroundScene() {
  const canvas = document.getElementById('webgl-bg');
  sceneBg = new THREE.Scene();
  
  // Subtle fog for depth
  sceneBg.fog = new THREE.FogExp2(0x05060a, 0.015);
  
  cameraBg = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  cameraBg.position.z = 30;
  
  rendererBg = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
  rendererBg.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendererBg.setSize(window.innerWidth, window.innerHeight);
  rendererBg.setClearColor(targetBgColor, 1.0);
  
  // Lights for background
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  sceneBg.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xff9933, 1.6);
  dirLight.position.set(0, 15, 10);
  sceneBg.add(dirLight);

  const goldLight = new THREE.PointLight(0xd4af37, 2, 50);
  goldLight.position.set(10, -10, 5);
  sceneBg.add(goldLight);

  // A. Golden particles system (Energy Flow Dust)
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;     // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 45; // Z
  }
  
  const particlesGeom = new THREE.BufferGeometry();
  particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Custom glowing circle particle
  const canvasParticle = document.createElement('canvas');
  canvasParticle.width = 16;
  canvasParticle.height = 16;
  const ctx = canvasParticle.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 223, 0, 1)');
  grad.addColorStop(0.3, 'rgba(255, 153, 51, 0.85)');
  grad.addColorStop(1, 'rgba(255, 153, 51, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  
  const particleTexture = new THREE.CanvasTexture(canvasParticle);
  
  const particlesMat = new THREE.PointsMaterial({
    size: 0.6,
    map: particleTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.75
  });
  
  bgParticles = new THREE.Points(particlesGeom, particlesMat);
  sceneBg.add(bgParticles);
  
  // B. Procedural 3D Lotus Petals
  const petalGeom = createPetalGeometry();
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: colors.saffron,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  
  const petalCount = 28;
  for (let i = 0; i < petalCount; i++) {
    const petalMesh = new THREE.Mesh(petalGeom, petalMaterial);
    
    resetPetal(petalMesh);
    // Stagger initial Y heights
    petalMesh.position.y = (Math.random() - 0.5) * 50;
    
    sceneBg.add(petalMesh);
    lotusPetals.push(petalMesh);
  }
}

// Procedural Lotus Petal Geometry Generation
function createPetalGeometry() {
  const segments = 20;
  const geom = new THREE.PlaneGeometry(1.5, 3.0, segments, segments);
  const pos = geom.attributes.position;
  
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const normalizedY = y / 1.5; // range: -1 to 1
    
    // Elongated width factor (wider in middle, narrow at bottom, point at top)
    const factor = Math.cos(normalizedY * Math.PI / 2);
    const adjustedFactor = normalizedY < 0 ? (normalizedY + 1) * 0.85 : factor;
    pos.setX(i, x * adjustedFactor);
    
    // Cupped warp on Z-axis
    const zCurve = -Math.cos(x * Math.PI / 1.5) * 0.3 * (1 - Math.abs(normalizedY));
    const yCurve = Math.sin((normalizedY + 1) * Math.PI / 2) * 0.15;
    pos.setZ(i, zCurve + yCurve);
  }
  
  geom.computeVertexNormals();
  return geom;
}

function resetPetal(petal) {
  petal.position.x = (Math.random() - 0.5) * 60;
  petal.position.y = 25 + Math.random() * 10;
  petal.position.z = (Math.random() - 0.5) * 20;
  
  petal.scale.setScalar(Math.random() * 0.75 + 0.35);
  
  petal.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  
  petal.userData = {
    speedY: Math.random() * 0.035 + 0.015,
    speedRotX: (Math.random() - 0.5) * 0.015,
    speedRotY: (Math.random() - 0.5) * 0.015,
    speedRotZ: (Math.random() - 0.5) * 0.01,
    amplitudeX: Math.random() * 1.5 + 0.5,
    frequencyX: Math.random() * 0.02 + 0.01,
    offsetX: Math.random() * 100
  };
}

/* 
=========================================
2. HERO SECTION 3D SCENE (Yoga Constellation, Mandala, Medals)
=========================================
*/
function initHeroScene() {
  const container = document.getElementById('hero-3d-canvas');
  if (!container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  sceneHero = new THREE.Scene();
  
  cameraHero = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  cameraHero.position.z = 13.5;
  
  rendererHero = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  rendererHero.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendererHero.setSize(width, height);
  rendererHero.shadowMap.enabled = true;
  container.appendChild(rendererHero.domElement);
  
  // Lights for Hero
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  sceneHero.add(ambient);
  
  const spotLight1 = new THREE.SpotLight(0xff9933, 4);
  spotLight1.position.set(10, 15, 10);
  spotLight1.angle = Math.PI / 6;
  spotLight1.penumbra = 0.8;
  sceneHero.add(spotLight1);
  
  const spotLight2 = new THREE.SpotLight(0xd4af37, 3);
  spotLight2.position.set(-10, -10, 8);
  spotLight2.angle = Math.PI / 6;
  sceneHero.add(spotLight2);
  
  const centerLight = new THREE.PointLight(0xff9933, 2, 10);
  centerLight.position.set(0, 0, 0);
  sceneHero.add(centerLight);

  // A. Glowing Sacred Geometry Background Mandala (Concentric spinning energy rings)
  mandalaGroup = new THREE.Group();
  mandalaGroup.position.set(0, 0.2, -0.8);
  sceneHero.add(mandalaGroup);
  
  const ringsCount = 5;
  for (let r = 0; r < ringsCount; r++) {
    const radius = 1.3 + r * 0.45;
    const segments = 32 + r * 8;
    
    // Alternative rings use dashed/solid outlines
    const ringGeom = new THREE.RingGeometry(radius, radius + 0.015, segments);
    
    const ringMat = new THREE.MeshBasicMaterial({
      color: colors.gold,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18 - r * 0.03, // fade outwards
      blending: THREE.AdditiveBlending
    });
    
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.z = Math.random() * Math.PI;
    
    // Store customized rotation speeds for breathing
    ringMesh.userData = {
      rotSpeed: (r % 2 === 0 ? 1 : -1) * (0.05 + r * 0.03),
      baseScale: 1.0,
      breathFreq: 0.8 + r * 0.2,
      ringIndex: r
    };
    
    mandalaGroup.add(ringMesh);
  }
  
  // Add radiating structural rays (Sacred Geometry grid spokes)
  const raysCount = 12;
  const rayGeom = new THREE.BufferGeometry();
  const rayPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3.2, 0)];
  rayGeom.setFromPoints(rayPoints);
  
  const rayMat = new THREE.LineBasicMaterial({
    color: colors.saffron,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending
  });
  
  for (let i = 0; i < raysCount; i++) {
    const ray = new THREE.Line(rayGeom, rayMat);
    ray.rotation.z = (i * Math.PI * 2) / raysCount;
    mandalaGroup.add(ray);
  }

  // B. Build the 3D Chakra Constellation Yoga Silhouette
  chakraGroup = new THREE.Group();
  chakraGroup.scale.set(1.35, 1.35, 1.35); // 35% larger chakra
  sceneHero.add(chakraGroup);
  
  // Silhouette Node coordinates representing a full lotus yoga pose relative to center (0,0,0)
  // [x, y, z, chakraIndex/colorIndex, nodeSize]
  const skeletonNodes = [
    // --- 7 CHAKRAS (Spine Centerline) ---
    [0.0, -1.8, 0.0, 0, 0.18],  // 1. Root (Base, Red)
    [0.0, -1.1, 0.0, 1, 0.18],  // 2. Sacral (Lower Spine, Orange)
    [0.0, -0.4, 0.0, 2, 0.18],  // 3. Solar Plexus (Navel, Yellow)
    [0.0, 0.3,  0.0, 3, 0.22],  // 4. Heart (Chest Center, Green)
    [0.0, 1.0,  0.0, 4, 0.18],  // 5. Throat (Neck, Cyan)
    [0.0, 1.6,  0.1, 5, 0.18],  // 6. Third Eye (Forehead, Indigo)
    [0.0, 2.1,  0.0, 6, 0.25],  // 7. Crown (Headtop, Violet - largest glowing core)
    
    // --- SKELETAL JOINTS (to complete human sitting form) ---
    // Shoulders
    [-0.9, 0.7, -0.1, -1, 0.08], // L Shoulder
    [0.9,  0.7, -0.1, -1, 0.08], // R Shoulder
    // Elbows
    [-1.3, -0.1, 0.2, -1, 0.07], // L Elbow
    [1.3,  -0.1, 0.2, -1, 0.07], // R Elbow
    // Wrists / Hands (resting in Mudra on knees)
    [-1.4, -1.0, 0.5, 3, 0.10],  // L Hand (Gyana Mudra, glowing green/saffron)
    [1.4,  -1.0, 0.5, 3, 0.10],  // R Hand (Gyana Mudra)
    // Knees (spread wide in Padmasana)
    [-1.8, -1.4, 0.6, -1, 0.09], // L Knee
    [1.8,  -1.4, 0.6, -1, 0.09], // R Knee
    // Hips
    [-0.6, -1.6, 0.1, -1, 0.08], // L Hip
    [0.6,  -1.6, 0.1, -1, 0.08]  // R Hip
  ];
  
  const meshNodes = [];
  
  // Render nodes as glowing spheres
  skeletonNodes.forEach((node) => {
    const x = node[0];
    const y = node[1];
    const z = node[2];
    const chIdx = node[3];
    const size = node[4];
    
    let color = colors.saffron;
    let isChakra = false;
    
    if (chIdx >= 0) {
      color = colors.chakras[chIdx];
      isChakra = true;
    } else {
      color = 0xddddff; // light silver-blue for general joints
    }
    
    const nodeGeom = new THREE.SphereGeometry(size, 32, 32);
    
    const nodeMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: isChakra ? 2.8 : 0.5,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    
    const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
    nodeMesh.position.set(x, y, z);
    chakraGroup.add(nodeMesh);
    
    nodeMesh.userData = {
      baseScale: 1.0,
      breathOffset: Math.random() * Math.PI,
      isChakra: isChakra,
      chIdx: chIdx
    };
    meshNodes.push(nodeMesh);
  });
  
  // Connect nodes with glowing constellation lines
  const connections = [
    // Spine (Root -> Crown)
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    
    // Shoulders -> Elbows -> Hands
    [4, 7], [7, 9], [9, 11], // Left arm
    [4, 8], [8, 10], [10, 12], // Right arm
    
    // Base -> Hips -> Knees -> Hands
    [0, 15], [15, 13], [13, 11], // Left leg
    [0, 16], [16, 14], [14, 12], // Right leg
    
    // Grid alignments
    [7, 3], [8, 3],   // Shoulders to Heart
    [15, 1], [16, 1], // Hips to Sacral
    [13, 0], [14, 0]  // Knees to Root
  ];
  
  connections.forEach(conn => {
    const nodeA = skeletonNodes[conn[0]];
    const nodeB = skeletonNodes[conn[1]];
    
    const points = [];
    points.push(new THREE.Vector3(nodeA[0], nodeA[1], nodeA[2]));
    points.push(new THREE.Vector3(nodeB[0], nodeB[1], nodeB[2]));
    
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    
    const lineMat = new THREE.LineBasicMaterial({
      color: colors.saffron,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    
    const line = new THREE.Line(lineGeom, lineMat);
    chakraGroup.add(line);
  });

  // C. Floating 3D Medals
  medalsGroup = new THREE.Group();
  sceneHero.add(medalsGroup);
  
  const medalGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
  
  goldMat = new THREE.MeshStandardMaterial({
    color: colors.gold,
    roughness: 0.12,
    metalness: 0.95
  });
  
  silverMat = new THREE.MeshStandardMaterial({
    color: colors.silver,
    roughness: 0.12,
    metalness: 0.95
  });
  
  goldGlassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    emissive: 0xd4af37,
    emissiveIntensity: 0.15,
    roughness: 0.15,
    metalness: 0.25,
    transparent: true,
    opacity: 0.65
  });
  
  goldMedal = new THREE.Mesh(medalGeom, goldMat);
  goldMedal.position.set(-3.2, 1.2, 1.0);
  goldMedal.rotation.set(Math.PI / 2 - 0.2, 0.4, 0);
  medalsGroup.add(goldMedal);
  
  silverMedal = new THREE.Mesh(medalGeom, silverMat);
  silverMedal.position.set(3.2, -0.8, 1.0);
  silverMedal.rotation.set(Math.PI / 2 + 0.1, -0.3, 0.2);
  medalsGroup.add(silverMedal);
  
  // Hanger Loops
  const loopGeom = new THREE.TorusGeometry(0.18, 0.04, 8, 24);
  const loopGold = new THREE.Mesh(loopGeom, goldMat);
  loopGold.position.set(0, 0.75, 0);
  loopGold.rotation.x = Math.PI / 2;
  goldMedal.add(loopGold);
  
  const loopSilver = new THREE.Mesh(loopGeom, silverMat);
  loopSilver.position.set(0, 0.75, 0);
  loopSilver.rotation.x = Math.PI / 2;
  silverMedal.add(loopSilver);
}

/* 
=========================================
3. THEME TOGGLING INTERPOLATION API
=========================================
*/
window.updateThreeTheme = function(isLight) {
  if (isLight) {
    targetBgColor.setHex(0xF8F5EF); // Light Mode backdrop (luxury cream-white)
    
    // 1. Update Connection Lines & Joints in Hero Scene
    if (chakraGroup) {
      chakraGroup.children.forEach(child => {
        if (child.isMesh) {
          if (!child.userData.isChakra) {
            // General skeletal joint (not a chakra node)
            child.material.color.setHex(0x4B5563); // Muted slate gray for strong contrast
            child.material.emissive.setHex(0x4B5563);
            child.material.emissiveIntensity = 0.15;
          } else {
            // Chakra node
            child.material.emissiveIntensity = 1.4; // Slightly reduce bloom to keep solid colors vibrant on white background
          }
          child.material.needsUpdate = true;
        } else if (child instanceof THREE.Line) {
          // Skeletal connection lines
          child.material.color.setHex(0xb38600); // Dark gold
          child.material.blending = THREE.NormalBlending; // Avoid additive blending on white background
          child.material.opacity = 0.75;
          child.material.needsUpdate = true;
        }
      });
    }

    // 2. Update Background Floating Particles
    if (bgParticles) {
      bgParticles.material.color.setHex(0xd4af37); // Soft gold particles
      bgParticles.material.blending = THREE.NormalBlending; // Avoid disappearing in additive blending
      bgParticles.material.opacity = 0.45; // 20% reduction & professional level
      bgParticles.material.needsUpdate = true;
    }

    // 3. Update Drifting Lotus Petals / Leaves (20% saturation reduction)
    if (lotusPetals && lotusPetals.length > 0) {
      lotusPetals.forEach(petal => {
        petal.material.color.setHex(0xd99a52); // Soft gold-saffron color
        petal.material.opacity = 0.42; // Visible but less distracting
        petal.material.needsUpdate = true;
      });
    }

    // 4. Update Medals to Translucent Luxury Gold Glass Orbs
    if (goldMedal && silverMedal) {
      goldMedal.material = goldGlassMat;
      silverMedal.material = goldGlassMat;
      goldMedal.children.forEach(c => {
        if (c.isMesh) c.material = goldGlassMat;
      });
      silverMedal.children.forEach(c => {
        if (c.isMesh) c.material = goldGlassMat;
      });
    }

    // 5. Update Mandala Rings & Rays in Hero Scene (Light Theme Gold Concentric Circles)
    if (mandalaGroup) {
      mandalaGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.material.color.setHex(0xD4AF37); // Primary Gold
          child.material.blending = THREE.NormalBlending; // Avoid desaturating on white background
          child.material.needsUpdate = true;
        } else if (child instanceof THREE.Line) {
          child.material.color.setHex(0xD4AF37); // Soft/Outer Gold
          child.material.blending = THREE.NormalBlending;
          child.material.opacity = 0.35; /* 30-40% contrast increase */
          child.material.needsUpdate = true;
        }
      });
    }

  } else {
    targetBgColor.setHex(0x05060a); // Dark Mode backdrop (deep space-black)
    
    // 1. Restore Connection Lines & Joints in Hero Scene
    if (chakraGroup) {
      chakraGroup.children.forEach(child => {
        if (child.isMesh) {
          if (!child.userData.isChakra) {
            child.material.color.setHex(0xddddff); // Light silver-blue
            child.material.emissive.setHex(0xddddff);
            child.material.emissiveIntensity = 0.5;
          } else {
            child.material.emissiveIntensity = 2.8;
          }
          child.material.needsUpdate = true;
        } else if (child instanceof THREE.Line) {
          child.material.color.setHex(colors.saffron);
          child.material.blending = THREE.AdditiveBlending;
          child.material.opacity = 0.45;
          child.material.needsUpdate = true;
        }
      });
    }

    // 2. Restore Background Floating Particles
    if (bgParticles) {
      bgParticles.material.color.setHex(0xffffff); // White/glow particles
      bgParticles.material.blending = THREE.AdditiveBlending;
      bgParticles.material.opacity = 0.75;
      bgParticles.material.needsUpdate = true;
    }

    // 3. Restore Drifting Lotus Petals / Leaves
    if (lotusPetals && lotusPetals.length > 0) {
      lotusPetals.forEach(petal => {
        petal.material.color.setHex(colors.saffron);
        petal.material.opacity = 0.65;
        petal.material.needsUpdate = true;
      });
    }

    // 4. Restore Medals to Metallic Materials
    if (goldMedal && silverMedal) {
      goldMedal.material = goldMat;
      silverMedal.material = silverMat;
      goldMedal.children.forEach(c => {
        if (c.isMesh) c.material = goldMat;
      });
      silverMedal.children.forEach(c => {
        if (c.isMesh) c.material = silverMat;
      });
    }

    // 5. Restore Mandala Rings & Rays (Dark Theme)
    if (mandalaGroup) {
      mandalaGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.material.color.setHex(colors.gold);
          child.material.blending = THREE.AdditiveBlending;
          child.material.needsUpdate = true;
        } else if (child instanceof THREE.Line) {
          child.material.color.setHex(colors.saffron);
          child.material.blending = THREE.AdditiveBlending;
          child.material.opacity = 0.08;
          child.material.needsUpdate = true;
        }
      });
    }
  }
};

/* 
=========================================
4. DYNAMIC RENDERING LOOP
=========================================
*/
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();
  
  // Smoothly interpolate mouse movements (Lag-trail ease)
  mouseX += (targetMouseX - mouseX) * 0.08;
  mouseY += (targetMouseY - mouseY) * 0.08;
  
  // Smoothly interpolate scroll heights (Scroll lag-trail ease)
  scrollY += (targetScrollY - scrollY) * 0.1;
  
  // A. Interpolate WebGL Canvas clear colors and fog smoothly when toggling themes
  currentBgColor.lerp(targetBgColor, 0.06);
  if (rendererBg) {
    rendererBg.setClearColor(currentBgColor);
  }
  if (sceneBg && sceneBg.fog) {
    sceneBg.fog.color.copy(currentBgColor);
  }
  
  // B. Update Background Particles & Drifting Petals
  if (bgParticles) {
    bgParticles.rotation.y = time * 0.015;
    bgParticles.rotation.x = time * 0.008;
    // Push particles away slightly as user scrolls deep
    bgParticles.position.z = -scrollY * 0.008;
  }
  
  lotusPetals.forEach(petal => {
    petal.position.y -= petal.userData.speedY;
    
    // Wave ripple on X axis
    petal.position.x += Math.sin(time * petal.userData.frequencyX + petal.userData.offsetX) * 0.008;
    
    // Rotate petal
    petal.rotation.x += petal.userData.speedRotX;
    petal.rotation.y += petal.userData.speedRotY;
    petal.rotation.z += petal.userData.speedRotZ;
    
    // Reset if fallen past bottom
    if (petal.position.y < -30) {
      resetPetal(petal);
    }
  });
  
  // Background camera parallax tracking
  if (cameraBg) {
    cameraBg.position.x = mouseX * 2.5;
    cameraBg.position.y = -mouseY * 2.5 + (scrollY * 0.01); // scroll moves camera down
    cameraBg.lookAt(sceneBg.position);
  }
  
  rendererBg.render(sceneBg, cameraBg);
  
  // C. Update Hero 3D Canvas
  if (sceneHero) {
    
    // Rotating concentric wireframe Mandala logic
    if (mandalaGroup) {
      // Gentle breathing scale pulsing
      const mandalaPulse = 1.0 + Math.sin(time * 0.6) * 0.05;
      mandalaGroup.scale.set(mandalaPulse, mandalaPulse, mandalaPulse);
      
      // Rotate nested rings in opposite directions
      const isLight = document.body.classList.contains('light-theme');
      mandalaGroup.children.forEach(child => {
        if (child.userData.rotSpeed) {
          child.rotation.z += child.userData.rotSpeed * delta * 0.5;
          // Soft opacity breathing
          const ringBreath = Math.sin(time * child.userData.breathFreq) * (isLight ? 0.025 : 0.04);
          const baseOpacity = isLight 
            ? (0.45 - (child.userData.ringIndex || 0) * 0.05) 
            : (0.18 - child.userData.breathFreq * 0.01);
          child.material.opacity = Math.max(0.12, baseOpacity + ringBreath);
        }
      });
      
      // Rotate mandala group with scroll parallax
      mandalaGroup.rotation.y = mouseX * 0.2 + (scrollY * 0.0005);
      mandalaGroup.rotation.x = -mouseY * 0.1;
    }
    
    // 3D Constellation Yogi floating, breathing, and scroll-parallax
    if (chakraGroup) {
      // Gentle vertical float
      chakraGroup.position.y = Math.sin(time * 0.7) * 0.12;
      
      // Scroll-depth parallax translation
      chakraGroup.position.z = -scrollY * 0.002;
      
      // Mouse tracking parallax
      chakraGroup.rotation.y = mouseX * 0.8 + (scrollY * 0.001); // rotates Yogi as you scroll!
      chakraGroup.rotation.x = -mouseY * 0.4;
      
      // Nodes breathing animation
      chakraGroup.children.forEach(child => {
        if (child.userData.isChakra) {
          const breath = Math.sin(time * 1.3 + child.userData.breathOffset);
          const scale = 1.0 + breath * 0.08;
          child.scale.set(scale, scale, scale);
          
          // Animate Crown/Heart nodes glow intensities
          if (child.userData.chIdx === 6 || child.userData.chIdx === 3) {
            const isLight = document.body.classList.contains('light-theme');
            const baseIntensity = isLight ? 1.2 : 2.4;
            const amp = isLight ? 0.2 : 0.5;
            child.material.emissiveIntensity = baseIntensity + Math.sin(time * 2.2) * amp;
          }
        }
      });
    }
    
    // Medals floating & rotating animation
    if (medalsGroup) {
      medalsGroup.rotation.y = mouseX * 0.3;
      medalsGroup.rotation.x = -mouseY * 0.2;
      // Float medals slightly on scroll depth
      medalsGroup.position.z = scrollY * 0.001;
    }
    
    if (goldMedal) {
      goldMedal.position.y = 1.2 + Math.sin(time * 1.0) * 0.15;
      goldMedal.rotation.y += delta * 0.65;
      goldMedal.rotation.x = Math.PI / 2 + Math.sin(time * 0.8) * 0.1;
    }
    
    if (silverMedal) {
      silverMedal.position.y = -0.8 + Math.sin(time * 0.85 + 1.5) * 0.15;
      silverMedal.rotation.y -= delta * 0.45;
      silverMedal.rotation.x = Math.PI / 2 + Math.cos(time * 0.7) * 0.1;
    }
    
    // Advanced 3D Scroll-Reactive Orbital Camera Sweep
    if (cameraHero) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 2500;
      // Orbit camera on a 90-degree sweep (0 to Math.PI/2) as page scrolls to bottom
      const orbitAngle = (scrollY / maxScroll) * Math.PI * 0.5;
      const radius = 13.5;
      
      cameraHero.position.x = Math.sin(orbitAngle) * radius + (mouseX * 0.6);
      cameraHero.position.z = Math.cos(orbitAngle) * radius;
      cameraHero.position.y = -mouseY * 0.6; // subtle mouse shift
      
      cameraHero.lookAt(0, 0.2, 0);
    }
    
    rendererHero.render(sceneHero, cameraHero);
  }
}
