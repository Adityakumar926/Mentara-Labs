import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function Auth3DSurfer() {
  const containerRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Mouse tracking ref (Normalized -1 to 1)
  const mouseX = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let renderer, scene, camera, pivot;

    // 1. Scene setup
    scene = new THREE.Scene();

    // Track measured model bounds (defaults match cartoon_surfer.glb until loaded)
    const modelBounds = {
      halfHeight: 0.5,
      maxRadius: 0.67,
    };

    // Helper function: dynamically fit camera so model is as large as possible without cutting off on any aspect ratio
    const fitCamera = (w, h) => {
      if (!camera || !renderer || w <= 0 || h <= 0) return;
      const aspect = w / h;
      camera.aspect = aspect;

      const safetyPadding = 1.1; // Clean breathing room around top/bottom/sides
      const fovRad = (camera.fov * Math.PI) / 180;
      const halfFovTan = Math.tan(fovRad / 2);

      // Account for front-most 3D depth (+Z radius of the circular island base)
      // so perspective foreshortening never clips the bottom of the base on wide/short screens
      const distV = modelBounds.maxRadius + (modelBounds.halfHeight * safetyPadding) / halfFovTan;
      const distH = modelBounds.maxRadius + (modelBounds.maxRadius * safetyPadding) / (halfFovTan * aspect);
      const dist = Math.max(distV, distH);

      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // 2. Camera setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    fitCamera(width, height);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdff4ff, 1.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // 5. Pivot group for centered rotation
    pivot = new THREE.Group();
    scene.add(pivot);

    // 6. Load GLTF model
    const loader = new GLTFLoader();
    const primaryUrl = '/models/cartoon_surfer_optimized.glb';
    const fallbackUrl = '/models/cartoon_surfer.glb';

    const handleModelSuccess = (gltf) => {
      const model = gltf.scene;

      // Auto-center model at origin (0, 0, 0) and record exact bounds
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      modelBounds.halfHeight = Math.max(size.y / 2, 0.45);
      modelBounds.maxRadius = Math.max(Math.hypot(size.x / 2, size.z / 2), 0.6);

      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;

      // Convert materials to Unlit (MeshBasicMaterial) for true vibrant saturated colors
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const oldMat = child.material;
          const unlitMat = new THREE.MeshBasicMaterial({
            map: oldMat.map || null,
            color: 0xffffff,
            side: THREE.FrontSide,
            toneMapped: false,
            transparent: oldMat.transparent || false,
            alphaTest: oldMat.alphaTest || 0,
          });

          if (unlitMat.map) {
            unlitMat.map.colorSpace = THREE.SRGBColorSpace;
            unlitMat.map.needsUpdate = true;
          }

          child.material = unlitMat;
        }
      });

      pivot.add(model);
      fitCamera(container.clientWidth || 400, container.clientHeight || 400);
      setIsLoaded(true);
    };

    loader.load(
      primaryUrl,
      handleModelSuccess,
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      () => {
        loader.load(
          fallbackUrl,
          handleModelSuccess,
          (xhr) => {
            if (xhr.total > 0) {
              setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          },
          (err) => {
            console.error('Failed to load 3D surfer model:', err);
            setHasError(true);
          }
        );
      }
    );

    // 7. Mouse move tracking (Horizontal tracking)
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const span = Math.max(rect.width / 2, window.innerWidth / 2);
      const x = (e.clientX - centerX) / span;
      mouseX.current = Math.max(-1, Math.min(1, x));
    };

    const handlePointerLeave = () => {
      mouseX.current = 0;
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', handlePointerLeave);

    // 8. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      fitCamera(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 9. Intersection Observer (Pause WebGL when off-screen)
    let isIntersecting = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting && !animationFrameId) {
        animate();
      } else if (!isIntersecting && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);

    // 10. Animation loop
    const animate = () => {
      if (!isIntersecting) {
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);

      if (pivot) {
        pivot.position.set(0, 0, 0);
        pivot.rotation.x = 0;
        pivot.rotation.z = 0;

        // Smooth horizontal rotation tracking cursor
        const targetRotY = mouseX.current * (Math.PI * 0.95);
        pivot.rotation.y += (targetRotY - pivot.rotation.y) * 0.085;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      {/* 3D WebGL Canvas */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      />

      {/* Loading Indicator (Light Theme Friendly) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/90">
            <div className="w-5 h-5 rounded-full border-2 border-sky-400/30 border-t-sky-500 animate-spin" />
            <span className="text-[11px] font-bold text-sky-900 tracking-wide font-mono">
              Loading 3D Model {loadProgress > 0 ? `${loadProgress}%` : ''}
            </span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-700 bg-white/80 px-3.5 py-1.5 rounded-xl border border-white shadow">
            3D Preview Unavailable
          </span>
        </div>
      )}
    </div>
  );
}
