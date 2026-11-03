import { ImageResponse } from "next/og";

export const alt = "AILU — Creating Moments. Delivering Smiles.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#111111", color: "#FFFDF7", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
    <div style={{ color: "#F5C400", fontSize: 100, fontWeight: 800, letterSpacing: 14 }}>AILU</div>
    <div style={{ marginTop: 28, color: "#F5C400", fontSize: 38, fontWeight: 600 }}>Creating Moments. Delivering Smiles.</div>
    <div style={{ marginTop: 20, color: "#FFFDF7", opacity: 0.8, fontSize: 24 }}>Based in Udupi · Planning celebrations across India</div>
  </div>, size);
}
