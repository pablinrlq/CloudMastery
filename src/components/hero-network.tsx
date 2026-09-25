"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Region = { pos: [number, number, number]; primary?: boolean; satellites: number; label: string };

// Hand-placed "cloud regions" (a core + a boundary ring + a handful of
// satellite server nodes), each mapped to a real pillar of the product —
// hovering one is meant to feel like probing an actual infra map, not a
// decorative particle field.
const REGIONS: Region[] = [
  { pos: [0, 0.5, 1], primary: true, satellites: 6, label: "CloudMastery" },
  { pos: [-5.6, 2, -1.8], satellites: 4, label: "Trilha guiada" },
  { pos: [5.4, 2.3, -1.2], satellites: 4, label: "Simulados" },
  { pos: [-4.2, -2.1, -2.2], satellites: 3, label: "Labs práticos" },
  { pos: [4.6, -1.7, -1], satellites: 3, label: "Flashcards" },
  { pos: [0.6, 3.3, -2.8], satellites: 3, label: "Diagnóstico" },
];

// Hub-and-spoke from the primary region plus a couple of cross-links, so the
// mesh reads as a real backbone topology rather than a full mesh of noise.
const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 2],
  [3, 4],
];

const ACCENT = 0xfb923c;
const SLATE = 0x94a3b8;
const ARC_SEGMENTS = 24;
const PULSE_MS = 700;

function glowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Fundo do hero: um mapa abstrato de infraestrutura cloud — regiões (hubs)
 * conectadas por uma malha com pacotes de dados viajando entre elas sobre um
 * piso em grade. Cada hub é uma área de hover/clique real (mapeada a um
 * pilar do produto) e a cena pode ser arrastada para girar manualmente.
 * Reage a scroll, pausa fora de tela e roda em qualquer largura de tela.
 */
export function HeroNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const label = labelRef.current;
    if (!container || !label) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(pointer: fine)").matches;
    const mobile = window.innerWidth < 640;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x080b12, 6, 17);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const baseCameraZ = mobile ? 12.5 : 10.5;
    camera.position.set(0, 1.3, baseCameraZ);
    camera.lookAt(0, -0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const sprite = glowTexture();

    // Floor grid — the "data center floor" the regions sit on, faded by fog.
    const grid = new THREE.GridHelper(28, 28, 0x334155, 0x1e293b);
    grid.position.y = -3.6;
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.35;
    group.add(grid);

    // Region hubs: core + boundary ring, plus a soft glow sprite on the primary.
    // Each core also gets an oversized invisible hit-sphere: the visible mark
    // is tiny at this scale, and a target that small is nearly impossible to
    // hover precisely (Fitts's law) — the hit-sphere is what raycasting uses.
    const hubMeshes: THREE.Mesh[] = [];
    const hitMeshes: THREE.Mesh[] = [];
    const ringMeshes: THREE.Mesh[] = [];
    const hubSprites: THREE.Sprite[] = [];
    REGIONS.forEach((region) => {
      const color = region.primary ? ACCENT : SLATE;
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(region.primary ? 0.22 : 0.14, 1),
        new THREE.MeshBasicMaterial({ color }),
      );
      core.position.set(...region.pos);
      group.add(core);
      hubMeshes.push(core);

      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
      );
      hitMesh.position.set(...region.pos);
      group.add(hitMesh);
      hitMeshes.push(hitMesh);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry((region.primary ? 0.42 : 0.28) * 0.82, region.primary ? 0.42 : 0.28, 40),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: region.primary ? 0.4 : 0.22, side: THREE.DoubleSide }),
      );
      ring.position.set(region.pos[0], region.pos[1] - (region.primary ? 0.55 : 0.4), region.pos[2]);
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);
      ringMeshes.push(ring);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color, transparent: true, opacity: region.primary ? 0.5 : 0.28, depthWrite: false }));
      glow.scale.setScalar(region.primary ? 1.6 : 1);
      glow.position.set(...region.pos);
      group.add(glow);
      hubSprites.push(glow);
    });

    // Satellite server nodes clustered around each region, plus short spokes to their hub.
    const satellitePositions: number[] = [];
    const spokePositions: number[] = [];
    REGIONS.forEach((region) => {
      for (let i = 0; i < region.satellites; i++) {
        const angle = (i / region.satellites) * Math.PI * 2 + Math.random() * 0.6;
        const radius = 0.75 + Math.random() * 0.5;
        const sx = region.pos[0] + Math.cos(angle) * radius;
        const sy = region.pos[1] + (Math.random() - 0.5) * 0.5;
        const sz = region.pos[2] + Math.sin(angle) * radius;
        satellitePositions.push(sx, sy, sz);
        spokePositions.push(region.pos[0], region.pos[1], region.pos[2], sx, sy, sz);
      }
    });
    const satelliteGeometry = new THREE.BufferGeometry();
    satelliteGeometry.setAttribute("position", new THREE.Float32BufferAttribute(satellitePositions, 3));
    const satelliteMaterial = new THREE.PointsMaterial({ size: 0.16, map: sprite, transparent: true, opacity: 0.8, color: SLATE, depthWrite: false, sizeAttenuation: true });
    const satellitePoints = new THREE.Points(satelliteGeometry, satelliteMaterial);
    group.add(satellitePoints);

    const spokeGeometry = new THREE.BufferGeometry();
    spokeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(spokePositions, 3));
    const spokeMaterial = new THREE.LineBasicMaterial({ color: SLATE, transparent: true, opacity: 0.12 });
    group.add(new THREE.LineSegments(spokeGeometry, spokeMaterial));

    // Backbone arcs between regions, each an arced bezier (not a straight line).
    const curves = LINKS.map(([a, b]) => {
      const start = new THREE.Vector3(...REGIONS[a].pos);
      const end = new THREE.Vector3(...REGIONS[b].pos);
      const mid = start.clone().lerp(end, 0.5);
      const lift = start.distanceTo(end) * 0.22;
      mid.y += lift;
      return new THREE.QuadraticBezierCurve3(start, mid, end);
    });

    const arcPositions: number[] = [];
    curves.forEach((curve) => {
      const pts = curve.getPoints(ARC_SEGMENTS);
      for (let i = 0; i < pts.length - 1; i++) {
        arcPositions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      }
    });
    const arcGeometry = new THREE.BufferGeometry();
    arcGeometry.setAttribute("position", new THREE.Float32BufferAttribute(arcPositions, 3));
    const arcMaterial = new THREE.LineBasicMaterial({ color: 0xfdba74, transparent: true, opacity: 0.32 });
    group.add(new THREE.LineSegments(arcGeometry, arcMaterial));

    // Data packets travelling along the backbone.
    const packets = curves.map((curve, i) => ({ curve, t: i / curves.length, speed: 0.11 + (i % 3) * 0.03 }));
    const packetGeometry = new THREE.BufferGeometry();
    packetGeometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(packets.length * 3), 3));
    const packetMaterial = new THREE.PointsMaterial({ size: 0.22, map: sprite, transparent: true, opacity: 0.95, color: ACCENT, depthWrite: false, sizeAttenuation: true });
    const packetPoints = new THREE.Points(packetGeometry, packetMaterial);
    group.add(packetPoints);

    // ---- Interaction state -------------------------------------------------
    let pointerX = 0;
    let pointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;
    let ndcX = 0;
    let ndcY = 0;
    let pointerActive = false;
    let hoveredIndex = -1;
    const hubScale = hubMeshes.map(() => 1);
    const pulseAt = hubMeshes.map(() => -Infinity);

    let dragging = false;
    let dragMoved = false;
    let dragStartClientX = 0;
    let dragStartClientY = 0;
    let dragStartOffsetX = 0;
    let dragStartOffsetY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const setCursor = (value: string) => {
      container.style.cursor = value;
    };
    if (canHover) setCursor("grab");

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((clientY - rect.top) / rect.height - 0.5) * 2;
      ndcX = pointerX;
      ndcY = -pointerY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerActive = true;
      updatePointer(event.clientX, event.clientY);
      if (dragging) {
        const dx = event.clientX - dragStartClientX;
        const dy = event.clientY - dragStartClientY;
        if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
        dragOffsetY = dragStartOffsetY + dx * 0.006;
        dragOffsetX = Math.max(-0.6, Math.min(0.6, dragStartOffsetX + dy * 0.006));
      }
    };
    const disableSelection = () => {
      document.body.style.userSelect = "none";
      (document.body.style as unknown as { webkitUserSelect: string }).webkitUserSelect = "none";
    };
    const restoreSelection = () => {
      document.body.style.userSelect = "";
      (document.body.style as unknown as { webkitUserSelect: string }).webkitUserSelect = "";
    };
    // Belt and suspenders: userSelect covers most browsers, but the exact
    // moment a mouse-drag starts a native selection varies enough (Safari in
    // particular) that we also veto the selectstart event directly.
    const handleSelectStart = (event: Event) => {
      if (dragging) event.preventDefault();
    };
    document.addEventListener("selectstart", handleSelectStart);

    const handlePointerDown = (event: PointerEvent) => {
      if (!canHover || event.pointerType === "touch") return;
      // Skip real controls (links, buttons) so drag-to-rotate never eats a
      // click, and prevent the native text-selection drag the browser would
      // otherwise start under the cursor.
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select")) return;
      event.preventDefault();
      dragging = true;
      dragMoved = false;
      dragStartClientX = event.clientX;
      dragStartClientY = event.clientY;
      dragStartOffsetX = dragOffsetX;
      dragStartOffsetY = dragOffsetY;
      setCursor("grabbing");
      disableSelection();
    };
    const handlePointerUp = () => {
      if (!dragging) return;
      dragging = false;
      restoreSelection();
      if (!dragMoved && hoveredIndex >= 0) pulseAt[hoveredIndex] = performance.now();
      setCursor(hoveredIndex >= 0 ? "pointer" : "grab");
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointerup", handlePointerUp);
    }

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let inView = true;
    let loopActive = false;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      // startLoop() (not renderFrame() directly) — renderFrame's own
      // recursive requestAnimationFrame chain must stay the only chain, or
      // two concurrent chains end up racing to write the same closure state.
      if (inView && !reduceMotion) startLoop();
    });
    intersectionObserver.observe(container);

    const mountedAt = performance.now();
    const INTRO_MS = 1500;

    let frameId = 0;
    const clock = new THREE.Clock();
    const startLoop = () => {
      if (loopActive) return;
      loopActive = true;
      renderFrame();
    };
    const renderFrame = () => {
      if (!inView) {
        loopActive = false;
        frameId = 0;
        return;
      }
      const now = performance.now();
      const t = clock.getElapsedTime();
      const introT = reduceMotion ? 1 : Math.min(1, (now - mountedAt) / INTRO_MS);
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      const scrollProgress = Math.min(1, Math.max(0, (viewportH - rect.top) / (rect.height + viewportH)));

      // Smoothed + gentle pointer parallax: strong enough to feel alive, soft
      // enough that a hub never "runs away" from a cursor closing in on it.
      smoothPointerX = lerp(smoothPointerX, pointerX, 0.06);
      smoothPointerY = lerp(smoothPointerY, pointerY, 0.06);
      group.rotation.y = t * 0.035 + smoothPointerX * 0.02 + dragOffsetY;
      group.rotation.x = Math.sin(t * 0.1) * 0.03 + smoothPointerY * 0.015 + dragOffsetX;
      group.position.y = -scrollProgress * 1.2;
      camera.position.z = baseCameraZ - scrollProgress * 1.2;
      camera.position.y = 1.3 + scrollProgress * 0.5;
      container.style.opacity = String(Math.max(0, 1 - Math.max(0, scrollProgress - 0.55) / 0.45));

      // Hover raycast, done after rotation so hit-testing matches this frame's pose.
      if (canHover && !reduceMotion && pointerActive) {
        group.updateMatrixWorld(true);
        pointerNdc.set(ndcX, ndcY);
        raycaster.setFromCamera(pointerNdc, camera);
        const hit = raycaster.intersectObjects(hitMeshes)[0];
        const nextHovered = hit ? hitMeshes.indexOf(hit.object as THREE.Mesh) : -1;
        if (nextHovered !== hoveredIndex) {
          hoveredIndex = nextHovered;
          if (!dragging) setCursor(hoveredIndex >= 0 ? "pointer" : "grab");
        }
      }

      hubMeshes.forEach((mesh, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, introT * 1.6 - i * 0.08)));
        const pulseElapsed = now - pulseAt[i];
        const pulse = pulseElapsed >= 0 && pulseElapsed < PULSE_MS ? Math.sin((pulseElapsed / PULSE_MS) * Math.PI) * 0.5 : 0;
        const hoverBoost = i === hoveredIndex ? 0.32 : 0;
        hubScale[i] = lerp(hubScale[i], 1 + hoverBoost + pulse, 0.18);
        mesh.scale.setScalar(local * hubScale[i]);
        mesh.rotation.y = t * 0.4;
      });
      hubSprites.forEach((s, i) => {
        const local = easeOutCubic(Math.min(1, Math.max(0, introT * 1.6 - i * 0.08)));
        const ambientPulse = 1 + Math.sin(t * 1.4 + i) * 0.06;
        const hoverGlow = i === hoveredIndex ? 1.5 : 1;
        (s.material as THREE.SpriteMaterial).opacity = (REGIONS[i].primary ? 0.5 : 0.28) * (i === hoveredIndex ? 1.6 : 1) * easeOutCubic(introT);
        s.scale.setScalar((REGIONS[i].primary ? 1.6 : 1) * local * ambientPulse * lerp(1, hoverGlow, 0.6));
      });
      arcMaterial.opacity = 0.32 * easeOutCubic(introT);
      spokeMaterial.opacity = 0.12 * easeOutCubic(introT);
      satelliteMaterial.opacity = 0.8 * easeOutCubic(introT);

      const positions = packetGeometry.attributes.position.array as Float32Array;
      packets.forEach((p, i) => {
        p.t = (p.t + p.speed * 0.016) % 1;
        const pos = p.curve.getPoint(p.t);
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      });
      packetGeometry.attributes.position.needsUpdate = true;
      packetMaterial.opacity = 0.95 * easeOutCubic(introT);

      // Floating label for the hovered region, projected to screen space.
      if (hoveredIndex >= 0 && rect.width > 0) {
        const worldPos = new THREE.Vector3().setFromMatrixPosition(hubMeshes[hoveredIndex].matrixWorld);
        worldPos.project(camera);
        const rawX = (worldPos.x * 0.5 + 0.5) * rect.width;
        const x = Math.max(90, Math.min(rect.width - 90, rawX));
        const y = Math.max(48, (-worldPos.y * 0.5 + 0.5) * rect.height);
        label.textContent = REGIONS[hoveredIndex].label;
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -140%)`;
        label.style.opacity = "1";
      } else {
        label.style.opacity = "0";
      }

      renderer.render(scene, camera);
      if (!reduceMotion || introT < 1) {
        frameId = requestAnimationFrame(renderFrame);
      } else {
        loopActive = false;
      }
    };
    startLoop();

    return () => {
      loopActive = false;
      if (frameId) cancelAnimationFrame(frameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("selectstart", handleSelectStart);
      if (dragging) restoreSelection();
      sprite.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      [...hubMeshes, ...hitMeshes, ...ringMeshes].forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      hubSprites.forEach((s) => (s.material as THREE.Material).dispose());
      satelliteGeometry.dispose();
      satelliteMaterial.dispose();
      spokeGeometry.dispose();
      spokeMaterial.dispose();
      arcGeometry.dispose();
      arcMaterial.dispose();
      packetGeometry.dispose();
      packetMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 transition-opacity duration-300" aria-hidden>
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full border border-orange-400/30 bg-[#0b0f17]/90 px-3 py-1.5 font-mono text-xs font-semibold text-orange-200 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur transition-opacity duration-150"
      />
    </div>
  );
}
