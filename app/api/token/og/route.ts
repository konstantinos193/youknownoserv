import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "ODINSCAN"
  const description = searchParams.get("description") || "Odin.fun Token Analysis Tool"

  return new ImageResponse(
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
        {title}
      </h1>
      <p style={{ color: "#0FF4C6", fontSize: 24, margin: 0 }}>
        {description}
      </p>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
