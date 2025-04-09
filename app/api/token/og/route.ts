import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get dynamic parameters if any
    const title = searchParams.get("title") || "ODINSCAN"
    const description = searchParams.get("description") || "Odin.fun Token Analysis Tool"
    const tokenId = searchParams.get("token") || null

    // Load the font
    const interBold = await fetch(new URL("../../assets/Inter-Bold.ttf", import.meta.url)).then((res) =>
      res.arrayBuffer(),
    )

    const interRegular = await fetch(new URL("../../assets/Inter-Regular.ttf", import.meta.url)).then((res) =>
      res.arrayBuffer(),
    )

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(15, 244, 198, 0.2) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(240, 230, 140, 0.2) 0%, transparent 40%)",
          padding: 50,
          position: "relative",
        }}
      >
        {/* Border */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "2px solid rgba(15, 244, 198, 0.3)",
            borderRadius: 20,
            zIndex: 0,
          }}
        />

        {/* Logo and Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
            zIndex: 1,
          }}
        >
          <img
            src="https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png"
            alt="ODINSCAN Logo"
            width={100}
            height={100}
            style={{ marginRight: 20 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontFamily: "Inter Bold",
                color: "#F0E68C",
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 24,
                fontFamily: "Inter Regular",
                color: "#0FF4C6",
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Token Image if available */}
        {tokenId && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
              zIndex: 1,
            }}
          >
            <img
              src={`https://images.odin.fun/token/${tokenId}`}
              alt={`Token ${tokenId}`}
              width={150}
              height={150}
              style={{ borderRadius: 10 }}
            />
            <div
              style={{
                marginLeft: 20,
                padding: "10px 20px",
                backgroundColor: "rgba(15, 244, 198, 0.1)",
                borderRadius: 10,
                border: "1px solid rgba(15, 244, 198, 0.3)",
              }}
            >
              <p
                style={{
                  fontSize: 24,
                  fontFamily: "Inter Bold",
                  color: "#F0E68C",
                  margin: 0,
                }}
              >
                Token ID: {tokenId}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "calc(100% - 100px)",
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontSize: 24,
              fontFamily: "Inter Regular",
              color: "#F0E68C",
              opacity: 0.7,
            }}
          >
            odinscan.fun
          </p>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 30,
            fontSize: 32,
            color: "rgba(15, 244, 198, 0.2)",
          }}
        >
          ᚨ
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            fontSize: 32,
            color: "rgba(240, 230, 140, 0.2)",
          }}
        >
          ᚱ
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter Bold",
            data: interBold,
            style: "normal",
            weight: 700,
          },
          {
            name: "Inter Regular",
            data: interRegular,
            style: "normal",
            weight: 400,
          },
        ],
      },
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
