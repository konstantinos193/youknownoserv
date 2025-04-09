import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ODINSCAN - Token Analysis Tool";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "40px",
        }}
      >
        <h1 style={{ color: "#F0E68C", fontSize: 60, margin: "0 0 20px 0" }}>
          ODINSCAN
        </h1>
        <p style={{ color: "#0FF4C6", fontSize: 24, margin: 0 }}>
          Odin.fun Token Analysis Tool
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
} 