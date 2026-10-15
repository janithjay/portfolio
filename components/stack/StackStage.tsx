"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LAYERS } from "@/lib/stack";
import type { StackScene } from "./scene";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The sticky stage behind the hero and the stack story.
 * Starts as the server-rendered CSS-3D stack (works without JS), then upgrades to
 * the three.js scene on first interaction or once the page has settled.
 */
export function StackStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<StackScene | null>(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(-1);
  const [active, setActive] = useState(-1);

  // scroll → explode progress + active chapter (drives both renderers)
  useEffect(() => {
    const stage = stageRef.current;
    const section = stage?.closest("section");
    if (!stage || !section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - vh)));
      const explode = smooth(0.02, 0.22, p) * (1 - 0.6 * smooth(0.9, 1, p));
      stage.style.setProperty("--explode", explode.toFixed(3));
      sceneRef.current?.setProgress(explode);

      let best = -1;
      let bestDist = Infinity;
      section.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestDist && d < vh * 0.45) {
          bestDist = d;
          best = Number(el.dataset.chapter);
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setActive(active);
    stageRef.current?.style.setProperty("--active", String(active));
    stageRef.current?.closest("section")?.setAttribute("data-active", String(active));
  }, [active]);

  // progressive upgrade to WebGL
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || !webglAvailable()) return;
    let cancelled = false;
    let started = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = async () => {
      if (started) return;
      started = true;
      cleanupTriggers();
      const { createStackScene } = await import("./scene");
      if (cancelled || !glRef.current) return;
      const scene = createStackScene(glRef.current, {
        reducedMotion: reduce.matches,
        onHover: setHover,
        onSelect: (i) => router.push(LAYERS[i]!.href),
      });
      sceneRef.current = scene;
      window.dispatchEvent(new Event("scroll"));
      requestAnimationFrame(() => setReady(true));
    };

    const triggers = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const;
    const onTrigger = () => void start();
    triggers.forEach((t) => window.addEventListener(t, onTrigger, { passive: true, once: true }));
    const timer = window.setTimeout(onTrigger, 3500);
    function cleanupTriggers() {
      triggers.forEach((t) => window.removeEventListener(t, onTrigger));
      window.clearTimeout(timer);
    }

    // re-theme on scheme / token changes
    const mo = new MutationObserver(() => requestAnimationFrame(() => sceneRef.current?.retheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => sceneRef.current?.retheme();
    mq.addEventListener("change", onScheme);
    const headObs = new MutationObserver(() => sceneRef.current?.retheme());
    headObs.observe(document.head, { childList: true, subtree: true, characterData: true });

    // pause when off-screen
    const io = new IntersectionObserver(([e]) => sceneRef.current?.setVisible(!!e?.isIntersecting));
    if (stageRef.current) io.observe(stageRef.current);

    return () => {
      cancelled = true;
      cleanupTriggers();
      mo.disconnect();
      headObs.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onScheme);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [router]);

  const label = hover >= 0 ? LAYERS[hover] : null;

  return (
    <div ref={stageRef} className="stack-stage sticky top-0 h-[100svh] overflow-hidden" data-ready={ready || undefined}>
      <div className="stack-fallback absolute inset-0 transition-opacity duration-700" aria-hidden="true">
        {children}
      </div>
      <div ref={glRef} className="absolute inset-0 opacity-0 transition-opacity duration-700 [[data-ready]_&]:opacity-100" />
      {label && (
        <p className="pointer-events-none absolute right-[var(--gutter)] top-24 hidden font-mono text-xs uppercase tracking-[0.12em] text-accent-ink md:block" aria-hidden="true">
          {label.code} / {label.name} · click to open
        </p>
      )}
    </div>
  );
}
