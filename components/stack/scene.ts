import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  DirectionalLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Shape,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { LAYERS } from "@/lib/stack";
import { drawPlate, readPalette, type Palette } from "./artwork";

/**
 * "The stack" as an exploded view: four plates (interface → identity APIs →
 * models → firmware), packets of data rising through them, and a camera that
 * leans toward the pointer. Scroll progress explodes the stack; the active
 * chapter lifts and lights up its plate.
 */

const W = 4.4; // plate width (world units)
const D = 3.0; // plate depth
const T = 0.09; // plate thickness
const TEX_W = 1024;
const TEX_H = Math.round((TEX_W * D) / W);

export interface StackSceneOptions {
  reducedMotion: boolean;
  onHover?: (index: number) => void;
  onSelect?: (index: number) => void;
}

export interface StackScene {
  setProgress(p: number): void;
  setActive(i: number): void;
  retheme(): void;
  resize(): void;
  setVisible(v: boolean): void;
  dispose(): void;
}

function roundedPlate(): ExtrudeGeometry {
  const r = 0.16;
  const s = new Shape();
  const x = -W / 2, y = -D / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + W - r, y);
  s.quadraticCurveTo(x + W, y, x + W, y + r);
  s.lineTo(x + W, y + D - r);
  s.quadraticCurveTo(x + W, y + D, x + W - r, y + D);
  s.lineTo(x + r, y + D);
  s.quadraticCurveTo(x, y + D, x, y + D - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new ExtrudeGeometry(s, { depth: T, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); // lie flat, top face at y = T
  return g;
}

export function createStackScene(container: HTMLElement, opts: StackSceneOptions): StackScene {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 100);
  scene.add(new HemisphereLight(0xffffff, 0x222233, 1.6));
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(5, 9, 4);
  scene.add(key);

  const root = new Group();
  scene.add(root);

  let palette: Palette = readPalette();
  const bodyGeo = roundedPlate();
  const edgeGeo = new EdgesGeometry(bodyGeo, 25);
  const faceGeo = new PlaneGeometry(W - 0.06, D - 0.06);
  faceGeo.rotateX(-Math.PI / 2);

  interface Plate {
    group: Group;
    body: Mesh<ExtrudeGeometry, MeshStandardMaterial>;
    face: Mesh<PlaneGeometry, MeshBasicMaterial>;
    edges: LineSegments<EdgesGeometry, LineBasicMaterial>;
    canvas: HTMLCanvasElement;
    texture: CanvasTexture;
    lift: number;
    glow: number;
  }

  const plates: Plate[] = LAYERS.map((layer) => {
    const group = new Group();
    const body = new Mesh(bodyGeo, new MeshStandardMaterial({ roughness: 0.55, metalness: 0.15, transparent: true, opacity: 0.96 }));
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const texture = new CanvasTexture(c);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const face = new Mesh(faceGeo, new MeshBasicMaterial({ map: texture, transparent: true }));
    face.position.y = T + 0.017;
    const edges = new LineSegments(edgeGeo, new LineBasicMaterial({ transparent: true }));
    group.add(body, face, edges);
    group.userData.layer = layer.id;
    root.add(group);
    return { group, body, face, edges, canvas: c, texture, lift: 0, glow: 0 };
  });

  /* vias: vertical connectors between plates, length follows the explode */
  const VIA_COUNT = 10;
  const viaPos = new Float32Array(VIA_COUNT * 6);
  const viaSpots = Array.from({ length: VIA_COUNT }, (_, i) => [(((i * 37) % 10) / 10 - 0.45) * W * 0.85, (((i * 53) % 10) / 10 - 0.45) * D * 0.85] as const);
  const viaGeo = new BufferGeometry();
  viaGeo.setAttribute("position", new BufferAttribute(viaPos, 3));
  const vias = new LineSegments(viaGeo, new LineBasicMaterial({ transparent: true, opacity: 0.5 }));
  root.add(vias);

  /* packets: data rising from firmware to interface */
  const N = opts.reducedMotion ? 0 : 140;
  const pPos = new Float32Array(N * 3);
  const pSeed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const spot = viaSpots[i % VIA_COUNT]!;
    pPos[i * 3] = spot[0] + (Math.random() - 0.5) * 0.12;
    pPos[i * 3 + 2] = spot[1] + (Math.random() - 0.5) * 0.12;
    pSeed[i] = Math.random();
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute("position", new BufferAttribute(pPos, 3));
  const packets = new Points(pGeo, new PointsMaterial({ size: 0.06, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false }));
  root.add(packets);

  /* soft contact shadow */
  const sc = document.createElement("canvas");
  sc.width = sc.height = 256;
  const sctx = sc.getContext("2d")!;
  const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  const shadowGeo = new PlaneGeometry(W * 1.8, D * 1.8);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadow = new Mesh(shadowGeo, new MeshBasicMaterial({ map: new CanvasTexture(sc), transparent: true, depthWrite: false }));
  root.add(shadow);

  const state = { progress: 0, shown: 0, active: -1, hover: -1, visible: true };
  const pointer = new Vector2(0, 0);
  const lean = new Vector2(0, 0);
  const raycaster = new Raycaster();

  function retheme() {
    palette = readPalette();
    const lineStrong = new Color(palette.lineStrong);
    plates.forEach((pl, i) => {
      const active = i === state.active || i === state.hover;
      pl.body.material.color.set(palette.surface2);
      pl.edges.material.color.copy(active ? new Color(palette.accent) : lineStrong);
      drawPlate(pl.canvas, LAYERS[i]!.id, LAYERS[i]!.code, LAYERS[i]!.name, palette, active);
      pl.texture.needsUpdate = true;
    });
    (vias.material as LineBasicMaterial).color.set(palette.lineStrong);
    (packets.material as PointsMaterial).color.set(palette.accent);
    requestRender();
  }

  let width = 1;
  let height = 1;
  let fit = 1; // pull the camera back on portrait screens so the whole stack fits
  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // push the stack to the right on wide screens so the type has room on the left
    const wide = width / height > 1.15;
    if (wide) camera.setViewOffset(width, height, -width * 0.23, -height * 0.03, width, height);
    else camera.setViewOffset(width, height, 0, height * 0.17, width, height);
    fit = Math.max(1, 0.95 / camera.aspect);
    camera.updateProjectionMatrix();
    requestRender();
  }

  let raf = 0;
  let last = performance.now();
  let needsRender = true;
  function requestRender() {
    needsRender = true;
    if (!raf && state.visible) raf = requestAnimationFrame(frame);
  }

  function layout(dt: number, time: number) {
    // ease displayed progress toward target
    const k = opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 6);
    state.shown += (state.progress - state.shown) * k;
    const e = state.shown;
    const gap = 0.22 + e * 1.15;
    const n = plates.length;
    plates.forEach((pl, i) => {
      const targetLift = i === state.active ? 0.28 : i === state.hover ? 0.14 : 0;
      pl.lift += (targetLift - pl.lift) * k;
      const targetGlow = i === state.active || i === state.hover ? 1 : 0;
      pl.glow += (targetGlow - pl.glow) * k;
      const y = (n - 1 - i) * gap + pl.lift;
      pl.group.position.y = y + (opts.reducedMotion ? 0 : Math.sin(time * 0.8 + i * 0.9) * 0.025);
      pl.group.rotation.y = (i - (n - 1) / 2) * 0.1 * e;
      const dim = state.active >= 0 && i !== state.active ? 1 - 0.45 * e : 1;
      pl.face.material.opacity = dim;
      pl.body.material.opacity = 0.85 + 0.11 * dim;
      pl.edges.material.opacity = 0.55 + 0.45 * pl.glow;
    });
    const top = (n - 1) * gap;
    for (let v = 0; v < VIA_COUNT; v++) {
      const [x, z] = viaSpots[v]!;
      viaPos.set([x, T, z, x, top, z], v * 6);
    }
    viaGeo.attributes.position!.needsUpdate = true;
    (vias.material as LineBasicMaterial).opacity = 0.15 + 0.45 * e;
    shadow.position.y = -0.35 - e * 0.4;
    root.position.y = -top / 2;

    if (N) {
      for (let i = 0; i < N; i++) {
        const t = (pSeed[i]! + time * (0.05 + (i % 7) * 0.012)) % 1;
        pPos[i * 3 + 1] = T + t * top;
      }
      pGeo.attributes.position!.needsUpdate = true;
      (packets.material as PointsMaterial).opacity = 0.25 + 0.7 * e;
    }

    // camera: fixed isometric-ish rig that leans toward the pointer
    lean.x += (pointer.x - lean.x) * (opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    lean.y += (pointer.y - lean.y) * (opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    const dist = (15.5 + e * 2.5) * fit;
    const az = Math.PI / 4 + lean.x * 0.22 + (opts.reducedMotion ? 0 : Math.sin(time * 0.15) * 0.04);
    const el = 0.62 - e * 0.18 + lean.y * 0.1;
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    camera.lookAt(0, 0, 0);
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    layout(dt, now / 1000);
    renderer.render(scene, camera);
    needsRender = false;
    // keep animating while anything is still settling (or always, when motion is allowed)
    const settling = Math.abs(state.progress - state.shown) > 0.001 || plates.some((p, i) => Math.abs(p.lift - (i === state.active ? 0.28 : i === state.hover ? 0.14 : 0)) > 0.002);
    if (state.visible && (!opts.reducedMotion || settling || needsRender)) raf = requestAnimationFrame(frame);
  }

  function pick(e: PointerEvent): number {
    const rect = canvas.getBoundingClientRect();
    const ndc = new Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(plates.map((p) => p.body), false);
    return hits.length ? plates.findIndex((p) => p.body === hits[0]!.object) : -1;
  }

  const onMove = (e: PointerEvent) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    if (e.pointerType === "mouse") {
      const h = pick(e);
      if (h !== state.hover) {
        state.hover = h;
        canvas.style.cursor = h >= 0 ? "pointer" : "";
        opts.onHover?.(h);
        retheme();
      }
    }
    requestRender();
  };
  const onClick = (e: PointerEvent) => {
    const h = pick(e);
    if (h >= 0) opts.onSelect?.(h);
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("click", onClick as EventListener);

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // make sure the webfonts used on the plates are ready before the first draw
  const fontsReady = Promise.all([
    document.fonts.load(`760 40px ${palette.fontDisplay}`),
    document.fonts.load(`500 24px ${palette.fontMono}`),
  ]).catch(() => undefined);
  void fontsReady.then(retheme);
  retheme();
  resize();

  return {
    setProgress(p) {
      state.progress = Math.min(1, Math.max(0, p));
      requestRender();
    },
    setActive(i) {
      if (i === state.active) return;
      state.active = i;
      retheme();
    },
    retheme,
    resize,
    setVisible(v) {
      state.visible = v;
      if (v) {
        last = performance.now();
        requestRender();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick as EventListener);
      plates.forEach((p) => {
        p.texture.dispose();
        p.body.material.dispose();
        p.face.material.dispose();
        p.edges.material.dispose();
      });
      bodyGeo.dispose();
      edgeGeo.dispose();
      faceGeo.dispose();
      viaGeo.dispose();
      pGeo.dispose();
      shadowGeo.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
