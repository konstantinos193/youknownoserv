import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

export default async function GET() {
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
          padding: "40px",
        }}
      >
        <h1 style={{ color: "#F0E68C", fontSize: 60 }}>ODINSCAN</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 