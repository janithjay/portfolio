"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/**
 * Heavy demos load and hydrate only when they approach the viewport.
 * Until then the server-rendered fallback (passed as children) is what you see,
 * and it's what you get with JavaScript turned off.
 */
function Deferred({ children, render, minHeight }: { children: ReactNode; render: () => ReactNode; minHeight?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight }}>
      {near ? <Suspense fallback={children}>{render()}</Suspense> : children}
    </div>
  );
}

const Playground = lazy(() => import("@/components/playground/Playground"));
const PowerTrace = lazy(() => import("./PowerTraceDemo"));
const Robot = lazy(() => import("./RobotDemo"));
const Battery = lazy(() => import("./BatteryDemo")) as ComponentType<{ hfSpace?: string }>;

export function PlaygroundLazy({ children }: { children: ReactNode }) {
  return <Deferred render={() => <Playground />}>{children}</Deferred>;
}
export function PowerTraceLazy({ children }: { children: ReactNode }) {
  return <Deferred render={() => <PowerTrace />}>{children}</Deferred>;
}
export function RobotLazy({ children }: { children: ReactNode }) {
  return <Deferred render={() => <Robot />}>{children}</Deferred>;
}
export function BatteryLazy({ children, hfSpace }: { children: ReactNode; hfSpace?: string }) {
  return <Deferred render={() => <Battery hfSpace={hfSpace} />}>{children}</Deferred>;
}
