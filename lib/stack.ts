/**
 * The four layers of "the stack" — what I build, top to bottom.
 * Shared by the scroll story (DOM), the CSS-3D fallback and the three.js scene.
 */
export type LayerId = "ui" | "api" | "ml" | "hw";

export interface Layer {
  id: LayerId;
  code: string;
  name: string;
  title: string;
  body: string;
  tags: string[];
  href: string;
  cta: string;
}

export const LAYERS: Layer[] = [
  {
    id: "ui",
    code: "L4",
    name: "Interface",
    title: "Components developers drop in",
    body: "Self-service identity components for ThunderID: one contract, five SDKs, themeable through tokens instead of CSS overrides.",
    tags: ["React", "Next.js", "Vue", "Nuxt", "Express"],
    href: "/work/thunderid-identity-components",
    cta: "Identity components case study",
  },
  {
    id: "api",
    code: "L3",
    name: "Identity",
    title: "The APIs underneath",
    body: "Contributions to the ThunderID Go backend: the self-service endpoints those components call.",
    tags: ["Go", "REST", "Monorepo"],
    href: "/work/thunderid-identity-components#approach",
    cta: "How the layers split",
  },
  {
    id: "ml",
    code: "L2",
    name: "Models",
    title: "Signals into decisions",
    body: "Power-trace detection (and the bug that silently overwrote its threshold), plus an EV battery model on Hugging Face.",
    tags: ["Python", "Signal processing", "Hugging Face"],
    href: "/work/power-trace-detection",
    cta: "Threshold lab case study",
  },
  {
    id: "hw",
    code: "L1",
    name: "Firmware",
    title: "A robot that never reverses",
    body: "ESP32-S3 firmware with cliff detection first, obstacle avoidance second, and gyro-closed-loop turns. Reverse isn't a state.",
    tags: ["ESP32-S3", "IMU", "Sensors", "PWM"],
    href: "/work/esp32-autonomous-robot",
    cta: "Robot simulator case study",
  },
];

/** Shared scroll/interaction state between the DOM story and whichever renderer is active. */
export interface StackState {
  progress: number; // 0 = assembled, 1 = fully exploded
  active: number; // index into LAYERS, -1 for none
}
