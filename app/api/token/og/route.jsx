/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "ODINSCAN";
    const description = searchParams.get("description") || "Odin.fun Token Analysis Tool";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              color: "#F0E68C",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#0FF4C6",
              margin: "0",
              textAlign: "center",
            }}
          >
            {description}
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new Response("Failed to generate image", { status: 500 });
  }
} 