import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

async function font(file: string) {
  return readFile(path.join(process.cwd(), "lib", "og", file));
}

/** One OG template for every page: name, title, kicker, on the site's grid. */
export async function ogImage({ kicker, title, footer }: { kicker: string; title: string; footer?: string }) {
  const [displayFont, mono] = await Promise.all([font("bricolage.woff"), font("martian-mono.woff")]);
  const grid = "rgba(236,238,242,0.06)";
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
          background: "#06070B",
          backgroundImage: `linear-gradient(to right, ${grid} 1px, transparent 1px), linear-gradient(to bottom, ${grid} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          color: "#ECEEF2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Mono", fontSize: 24, color: "#9AA1B2", letterSpacing: 2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#C6F432" }} />
          {kicker.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontFamily: "Display", fontSize: title.length > 48 ? 84 : 104, lineHeight: 0.95, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 24, color: "#9AA1B2" }}>
          <span>Janith Jayashan · JJay</span>
          <span style={{ color: "#C6F432" }}>{footer ?? "identity · go · ml · robotics"}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: displayFont, style: "normal", weight: 800 },
        { name: "Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
