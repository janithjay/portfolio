import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

async function font(file: string) {
  return readFile(path.join(process.cwd(), "lib", "og", file));
}

/** One OG template for every page: name, title, kicker, on the site's grid. */
export async function ogImage({ kicker, title, footer }: { kicker: string; title: string; footer?: string }) {
  const [serif, mono] = await Promise.all([font("instrument-serif.woff"), font("jetbrains-mono.woff")]);
  const grid = "rgba(232,236,244,0.06)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#070B14",
          backgroundImage: `linear-gradient(to right, ${grid} 1px, transparent 1px), linear-gradient(to bottom, ${grid} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          color: "#E8ECF4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Mono", fontSize: 24, color: "#A0ABC0", letterSpacing: 2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#3DFFA2" }} />
          {kicker.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontFamily: "Serif", fontSize: title.length > 48 ? 76 : 96, lineHeight: 1.02, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 24, color: "#A0ABC0" }}>
          <span>Janith Jayashan · JJay</span>
          <span style={{ color: "#3DFFA2" }}>{footer ?? "identity · go · ml · robotics"}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Serif", data: serif, style: "normal", weight: 400 },
        { name: "Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
