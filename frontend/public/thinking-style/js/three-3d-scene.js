/**
 * Mentp Learning Compass | Real WebGL 3D Interactive Scene Engine
 * Uses Three.js to render soft pastel clay 3D objects with mouse/touch interaction.
 * 
 * The 6 Real 3D Objects:
 * 1. 'aurora-compass' (Landing / Intro)
 * 2. 'polyhedral-constellation' (Pattern Planet)
 * 3. 'kinetic-gears' (Switch Lab)
 * 4. 'celestial-astrolabe' (Story Ship)
 * 5. 'isometric-puzzle-cube' (Inventor's Workshop)
 * 6. 'laurel-trophy' (Final Discovery Report)
 */

export const Three3DScene = {
  activeInstances: new Map(),

  /**
   * Initializes a 3D scene in a container element
   */
  mount(container, objectType = 'aurora-compass', options = {}) {
    if (!container || !window.THREE) {
      console.warn('Three3DScene: Container or THREE library not ready');
      return null;
    }

    // Clean up existing instance in container if any
    this.unmount(container);

    const width = options.width || container.clientWidth || 220;
    const height = options.height || container.clientHeight || 220;

    // 1. Scene, Camera, Renderer
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new window.THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = window.THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Apply soft styling to canvas
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.setAttribute('aria-label', `Interactive 3D ${objectType}`);
    renderer.domElement.setAttribute('role', 'img');

    container.appendChild(renderer.domElement);

    // 2. Soft Pastel Clay Lighting System
    const ambientLight = new window.THREE.AmbientLight(0xFFFAF2, 0.9);
    scene.add(ambientLight);

    const keyLight = new window.THREE.DirectionalLight(0xFFF0DE, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new window.THREE.DirectionalLight(0xDDF5E9, 0.7);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const rimLight = new window.THREE.DirectionalLight(0xEAE4FF, 0.9);
    rimLight.position.set(0, -4, -3);
    scene.add(rimLight);

    // 3. Construct the Specific 3D Mesh Group
    const group = new window.THREE.Group();
    scene.add(group);

    this.build3DObject(group, objectType);

    // 4. Interactive Drag / Touch Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX);
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY);
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      targetRotationY += deltaX * 0.015;
      targetRotationX += deltaY * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    renderer.domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 5. Animation Loop with Reduced-Motion Check
    let animId = null;
    let isVisible = true;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const animate = () => {
      if (isVisible) {
        if (!mediaQuery.matches) {
          // Gentle idle rotation
          group.rotation.y += 0.008;
          group.rotation.x += 0.004;
        }

        // Smooth damping towards user drag rotation
        group.rotation.y += (targetRotationY - group.rotation.y) * 0.08;
        group.rotation.x += (targetRotationX - group.rotation.x) * 0.08;

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 6. Intersection Observer for Performance
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const instanceData = {
      renderer,
      scene,
      camera,
      group,
      animId,
      observer,
      cleanup: () => {
        cancelAnimationFrame(animId);
        observer.disconnect();
        renderer.domElement.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        renderer.domElement.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };

    this.activeInstances.set(container, instanceData);
    return instanceData;
  },

  /**
   * Builds the procedural 3D pastel clay meshes for each artifact
   */
  build3DObject(group, type) {
    const THREE = window.THREE;

    // Reusable Pastel Clay Materials
    const matMint = new THREE.MeshStandardMaterial({
      color: 0xDDF5E9,
      roughness: 0.42,
      metalness: 0.08
    });

    const matLavender = new THREE.MeshStandardMaterial({
      color: 0xEAE4FF,
      roughness: 0.38,
      metalness: 0.12
    });

    const matPeach = new THREE.MeshStandardMaterial({
      color: 0xFFE4D6,
      roughness: 0.45,
      metalness: 0.05
    });

    const matGold = new THREE.MeshStandardMaterial({
      color: 0xFFF1BD,
      roughness: 0.32,
      metalness: 0.35
    });

    const matBlue = new THREE.MeshStandardMaterial({
      color: 0xDFEDFF,
      roughness: 0.4,
      metalness: 0.1
    });

    const matEmerald = new THREE.MeshStandardMaterial({
      color: 0x2EA879,
      roughness: 0.3,
      metalness: 0.2
    });

    switch (type) {
      case 'aurora-compass': {
        // 1. Outer Torus Bezel (Lavender Clay)
        const torusGeo = new THREE.TorusGeometry(1.2, 0.16, 16, 64);
        const torusMesh = new THREE.Mesh(torusGeo, matLavender);
        group.add(torusMesh);

        // 2. Inner Dial Cylinder (Powder Blue)
        const dialGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.12, 48);
        dialGeo.rotateX(Math.PI / 2);
        const dialMesh = new THREE.Mesh(dialGeo, matBlue);
        group.add(dialMesh);

        // 3. Faceted 3D Star Needle (Gold North / Peach South)
        const needleNorthGeo = new THREE.ConeGeometry(0.24, 0.95, 4);
        const needleNorth = new THREE.Mesh(needleNorthGeo, matGold);
        needleNorth.position.y = 0.48;
        group.add(needleNorth);

        const needleSouthGeo = new THREE.ConeGeometry(0.24, 0.95, 4);
        needleSouthGeo.rotateZ(Math.PI);
        const needleSouth = new THREE.Mesh(needleSouthGeo, matPeach);
        needleSouth.position.y = -0.48;
        group.add(needleSouth);

        // 4. Center Emerald Pin
        const pinGeo = new THREE.SphereGeometry(0.18, 24, 24);
        const pin = new THREE.Mesh(pinGeo, matEmerald);
        pin.position.z = 0.15;
        group.add(pin);

        // 5. Orbiting Miniature Pastel Spheres
        const orb1Geo = new THREE.SphereGeometry(0.12, 16, 16);
        const orb1 = new THREE.Mesh(orb1Geo, matMint);
        orb1.position.set(1.5, 0.6, 0.2);
        group.add(orb1);

        const orb2 = new THREE.Mesh(orb1Geo, matPeach);
        orb2.position.set(-1.4, -0.7, -0.3);
        group.add(orb2);
        break;
      }

      case 'polyhedral-constellation': {
        // 1. Central Floating 3D Icosahedron (Lavender Clay)
        const icoGeo = new THREE.IcosahedronGeometry(0.9, 0);
        const icoMesh = new THREE.Mesh(icoGeo, matLavender);
        group.add(icoMesh);

        // Wireframe cage around it
        const wireGeo = new THREE.IcosahedronGeometry(1.15, 0);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0x78BFA5, wireframe: true, transparent: true, opacity: 0.6 });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        group.add(wireMesh);

        // Orbiting Faceted Crystal Nodes
        const octGeo = new THREE.OctahedronGeometry(0.22, 0);
        const oct1 = new THREE.Mesh(octGeo, matGold);
        oct1.position.set(1.4, 0.8, 0);
        group.add(oct1);

        const oct2 = new THREE.Mesh(octGeo, matMint);
        oct2.position.set(-1.3, -0.7, 0.5);
        group.add(oct2);

        const oct3 = new THREE.Mesh(octGeo, matPeach);
        oct3.position.set(0.4, -1.3, -0.6);
        group.add(oct3);
        break;
      }

      case 'kinetic-gears': {
        // 1. Primary Bevel Gear (Butter Yellow)
        const gear1Geo = new THREE.CylinderGeometry(0.95, 0.95, 0.25, 12);
        const gear1 = new THREE.Mesh(gear1Geo, matGold);
        gear1.position.set(-0.55, 0, 0);
        group.add(gear1);

        // 2. Interlocking Secondary Gear (Mint)
        const gear2Geo = new THREE.CylinderGeometry(0.65, 0.65, 0.22, 10);
        const gear2 = new THREE.Mesh(gear2Geo, matMint);
        gear2.position.set(0.7, 0.65, 0);
        group.add(gear2);

        // 3. Laboratory Flask Cylinder Base (Powder Blue)
        const flaskGeo = new THREE.CylinderGeometry(0.28, 0.5, 0.8, 16);
        const flask = new THREE.Mesh(flaskGeo, matBlue);
        flask.position.set(0.6, -0.7, 0.3);
        group.add(flask);
        break;
      }

      case 'celestial-astrolabe': {
        // 1. Outer Gimbal Ring (Gold)
        const ring1Geo = new THREE.TorusGeometry(1.2, 0.08, 16, 64);
        const ring1 = new THREE.Mesh(ring1Geo, matGold);
        group.add(ring1);

        // 2. Middle Ring (Powder Blue)
        const ring2Geo = new THREE.TorusGeometry(0.95, 0.07, 16, 64);
        const ring2 = new THREE.Mesh(ring2Geo, matBlue);
        ring2.rotation.x = Math.PI / 3;
        group.add(ring2);

        // 3. Inner Ring (Lavender)
        const ring3Geo = new THREE.TorusGeometry(0.72, 0.06, 16, 64);
        const ring3 = new THREE.Mesh(ring3Geo, matLavender);
        ring3.rotation.y = Math.PI / 4;
        group.add(ring3);

        // 4. Central Celestial Core Orb (Peach)
        const coreGeo = new THREE.SphereGeometry(0.35, 24, 24);
        const core = new THREE.Mesh(coreGeo, matPeach);
        group.add(core);
        break;
      }

      case 'isometric-puzzle-cube': {
        // Multi-block 3D isometric invention assembly
        const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);

        const b1 = new THREE.Mesh(boxGeo, matMint);
        b1.position.set(-0.3, -0.3, 0.3);
        group.add(b1);

        const b2 = new THREE.Mesh(boxGeo, matLavender);
        b2.position.set(0.3, -0.3, 0.3);
        group.add(b2);

        const b3 = new THREE.Mesh(boxGeo, matPeach);
        b3.position.set(-0.3, 0.3, 0.3);
        group.add(b3);

        const b4 = new THREE.Mesh(boxGeo, matGold);
        b4.position.set(0.3, 0.3, -0.3);
        group.add(b4);

        const b5 = new THREE.Mesh(boxGeo, matBlue);
        b5.position.set(-0.3, -0.3, -0.3);
        group.add(b5);
        break;
      }

      case 'laurel-trophy': {
        // 1. Hexagonal Pedestal Base
        const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.35, 6);
        const base = new THREE.Mesh(baseGeo, matBlue);
        base.position.y = -0.9;
        group.add(base);

        // 2. Faceted Discovery Star Trophy Head
        const starGeo = new THREE.DodecahedronGeometry(0.75, 0);
        const star = new THREE.Mesh(starGeo, matGold);
        star.position.y = 0.2;
        group.add(star);

        // 3. Floating Laurel Torus
        const laurelGeo = new THREE.TorusGeometry(1.05, 0.08, 12, 48);
        laurelGeo.rotateX(Math.PI / 6);
        const laurel = new THREE.Mesh(laurelGeo, matEmerald);
        laurel.position.y = 0.2;
        group.add(laurel);
        break;
      }

      default:
        break;
    }
  },

  /**
   * Destroys 3D scene in a container
   */
  unmount(container) {
    if (this.activeInstances.has(container)) {
      const instance = this.activeInstances.get(container);
      instance.cleanup();
      this.activeInstances.delete(container);
    }
  }
};
