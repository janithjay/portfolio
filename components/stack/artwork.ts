import type { LayerId } from "@/lib/stack";

/**
 * Plate artwork for the 3D stack, drawn with Canvas 2D and uploaded as textures.
 * Every colour comes from the live design tokens, so the scene re-themes with the site.
 */

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  lineStrong: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  warm: string;
  fontDisplay: string;
  fontMono: string;
  fontSans: string;
}

export function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const body = getComputedStyle(document.body);
  return {
    bg: v("--bg"),
    surface: v("--surface"),
    surface2: v("--surface-2"),
    line: v("--line"),
    lineStrong: v("--line-strong"),
    text: v("--text"),
    muted: v("--text-muted"),
    accent: v("--accent"),
    onAccent: v("--on-accent"),
    warm: v("--warm"),
    fontDisplay: v("--font-display") || "sans-serif",
    fontMono: v("--font-mono") || "monospace",
    fontSans: body.fontFamily || "sans-serif",
  };
}

type Ctx = CanvasRenderingContext2D;

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function gridBg(ctx: Ctx, w: number, h: number, p: Palette) {
  ctx.fillStyle = p.surface;
  rr(ctx, 0, 0, w, h, 28);
  ctx.fill();
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  for (let x = 32; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 32; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = p.lineStrong;
  ctx.lineWidth = 3;
  rr(ctx, 1.5, 1.5, w - 3, h - 3, 28);
  ctx.stroke();
}

function label(ctx: Ctx, p: Palette, code: string, name: string, w: number, h: number, active: boolean) {
  ctx.font = `500 26px ${p.fontMono}`;
  ctx.fillStyle = active ? p.accent : p.muted;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`${code} / ${name.toUpperCase()}`, 40, h - 36);
  // crop marks
  ctx.strokeStyle = active ? p.accent : p.lineStrong;
  ctx.lineWidth = 3;
  const m = 18;
  const L = 34;
  for (const [x, y, dx, dy] of [
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  }
}

function drawUi(ctx: Ctx, w: number, h: number, p: Palette) {
  // app window
  const x = 70, y = 70, ww = w * 0.56, hh = h - 170;
  ctx.fillStyle = p.bg;
  rr(ctx, x, y, ww, hh, 18);
  ctx.fill();
  ctx.strokeStyle = p.lineStrong;
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 0 ? p.warm : p.lineStrong;
    ctx.beginPath();
    ctx.arc(x + 28 + i * 24, y + 26, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // sign-in card
  const cx = x + 50, cy = y + 64, cw = ww - 100;
  ctx.fillStyle = p.text;
  ctx.font = `760 46px ${p.fontDisplay}`;
  ctx.fillText("Sign in to Acme", cx, cy + 40);
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = p.lineStrong;
    ctx.lineWidth = 2;
    rr(ctx, cx, cy + 74 + i * 72, cw, 52, 10);
    ctx.stroke();
    ctx.fillStyle = p.muted;
    ctx.fillRect(cx + 18, cy + 96 + i * 72, 90 + i * 40, 8);
  }
  ctx.fillStyle = p.accent;
  rr(ctx, cx, cy + 228, cw, 56, 10);
  ctx.fill();
  ctx.fillStyle = p.onAccent;
  ctx.font = `600 24px ${p.fontSans}`;
  ctx.fillText("Continue", cx + cw / 2 - 52, cy + 264);
  // framework chips + tokens
  const fx = x + ww + 50;
  ctx.font = `500 22px ${p.fontMono}`;
  ["REACT", "NEXT.JS", "VUE", "NUXT", "EXPRESS"].forEach((f, i) => {
    const yy = y + 10 + i * 58;
    ctx.strokeStyle = i === 0 ? p.accent : p.lineStrong;
    ctx.lineWidth = 2;
    rr(ctx, fx, yy, 220, 42, 21);
    ctx.stroke();
    ctx.fillStyle = i === 0 ? p.accent : p.text;
    ctx.fillText(f, fx + 22, yy + 29);
  });
  [p.accent, p.warm, p.text, p.lineStrong].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(fx + 24 + i * 50, y + 336, 18, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawApi(ctx: Ctx, w: number, h: number, p: Palette) {
  const rows: [string, string][] = [
    ["GET", "/users/me"],
    ["PATCH", "/users/me"],
    ["POST", "/users/me/password"],
    ["GET", "/flows/self-service"],
    ["DELETE", "/sessions/{id}"],
  ];
  ctx.font = `500 26px ${p.fontMono}`;
  rows.forEach(([m, path], i) => {
    const y = 96 + i * 66;
    ctx.fillStyle = i === 1 ? p.accent : p.surface2;
    rr(ctx, 70, y - 34, 128, 46, 8);
    ctx.fill();
    ctx.fillStyle = i === 1 ? p.onAccent : p.muted;
    ctx.fillText(m, 86, y - 3);
    ctx.fillStyle = p.text;
    ctx.fillText(path, 222, y - 3);
  });
  // service graph
  const nodes: [number, number, string][] = [
    [w * 0.74, 120, "sdk"],
    [w * 0.64, 300, "api"],
    [w * 0.86, 300, "store"],
    [w * 0.75, 470, "go"],
  ];
  ctx.strokeStyle = p.lineStrong;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  for (const [a, b] of [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 3],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(nodes[a]![0], nodes[a]![1]);
    ctx.lineTo(nodes[b]![0], nodes[b]![1]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  nodes.forEach(([x, y, t], i) => {
    ctx.fillStyle = i === 3 ? p.accent : p.bg;
    ctx.strokeStyle = i === 3 ? p.accent : p.lineStrong;
    ctx.beginPath();
    ctx.arc(x, y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = i === 3 ? p.onAccent : p.text;
    ctx.font = `600 22px ${p.fontMono}`;
    ctx.fillText(t, x - ctx.measureText(t).width / 2, y + 8);
  });
}

function drawMl(ctx: Ctx, w: number, h: number, p: Palette) {
  const x0 = 70, x1 = w * 0.66, yMid = h * 0.52;
  // threshold
  ctx.strokeStyle = p.warm;
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(x0, yMid - 70);
  ctx.lineTo(x1, yMid - 70);
  ctx.stroke();
  ctx.setLineDash([]);
  // trace
  ctx.strokeStyle = p.text;
  ctx.lineWidth = 3;
  ctx.beginPath();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  const spikes = [0.18, 0.37, 0.55, 0.81];
  for (let i = 0; i <= 220; i++) {
    const t = i / 220;
    const x = x0 + t * (x1 - x0);
    let y = yMid + rnd() * 36 + Math.sin(t * 9) * 10;
    for (const s of spikes) y -= 170 * Math.exp(-((t - s) ** 2) / 0.00006) * (s === 0.37 ? 0.45 : 1);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // detections
  ctx.fillStyle = p.accent;
  spikes.forEach((s) => {
    if (s === 0.37) return;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(x0 + s * (x1 - x0) - 10, 60, 20, h - 160);
    ctx.globalAlpha = 1;
  });
  // scatter (battery)
  const sx = w * 0.72, sw = w * 0.22;
  ctx.strokeStyle = p.lineStrong;
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, 80, sw, h - 200);
  for (let i = 0; i < 46; i++) {
    const t = i / 46;
    const px = sx + 12 + t * (sw - 24);
    const py = 110 + t * t * (h - 280) + rnd() * 40;
    ctx.fillStyle = i % 9 === 0 ? p.warm : p.accent;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHw(ctx: Ctx, w: number, h: number, p: Palette) {
  // traces
  ctx.strokeStyle = p.lineStrong;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  const cx = w * 0.36, cy = h * 0.46;
  for (let i = 0; i < 9; i++) {
    const off = (i - 4) * 26;
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy + off);
    ctx.lineTo(cx - 200 - Math.abs(i - 4) * 14, cy + off);
    ctx.lineTo(cx - 240 - Math.abs(i - 4) * 14, cy + off + (i < 4 ? -60 : 60));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 110, cy + off);
    ctx.lineTo(cx + 230, cy + off);
    ctx.lineTo(cx + 290, cy + off * 1.6);
    ctx.lineTo(w * 0.7, cy + off * 1.6);
    ctx.stroke();
  }
  // chip
  ctx.fillStyle = p.bg;
  ctx.strokeStyle = p.text;
  ctx.lineWidth = 3;
  rr(ctx, cx - 110, cy - 120, 220, 240, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = p.text;
  ctx.font = `760 40px ${p.fontDisplay}`;
  ctx.fillText("ESP32", cx - 62, cy - 4);
  ctx.font = `500 24px ${p.fontMono}`;
  ctx.fillStyle = p.accent;
  ctx.fillText("-S3", cx - 24, cy + 34);
  // robot top view
  const rx = w * 0.82, ry = h * 0.42;
  ctx.fillStyle = p.accent;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.arc(rx, ry, 150, -0.35 - Math.PI / 2, 0.35 - Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.text;
  ctx.beginPath();
  ctx.arc(rx, ry, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.bg;
  ctx.fillRect(rx - 4, ry - 58, 8, 40);
  for (const s of [-1, 1]) {
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.arc(rx + s * 34, ry - 62, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = `500 22px ${p.fontMono}`;
  ctx.fillStyle = p.muted;
  ctx.fillText("REVERSE: 0", rx - 66, ry + 110);
}

const DRAW: Record<LayerId, (ctx: Ctx, w: number, h: number, p: Palette) => void> = {
  ui: drawUi,
  api: drawApi,
  ml: drawMl,
  hw: drawHw,
};

export function drawPlate(canvas: HTMLCanvasElement, id: LayerId, code: string, name: string, p: Palette, active: boolean) {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  gridBg(ctx, w, h, p);
  DRAW[id](ctx, w, h, p);
  label(ctx, p, code, name, w, h, active);
}
