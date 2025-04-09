import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "ODINSCAN Token Analysis"
export const size = {
  width: 1200,
  height: 630,
}

// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  const tokenId = params.id

  try {
    // You could fetch token data here to display in the image
    // const token = await fetch(`https://api.odinscan.fun/token/${tokenId}`).then(res => res.json())

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
                color: "#F0E68C",
                margin: 0,
              }}
            >
              ODINSCAN
            </h1>
            <p
              style={{
                fontSize: 24,
                color: "#0FF4C6",
                margin: 0,
              }}
            >
              Token Analysis
            </p>
          </div>
        </div>

        {/* Token Info */}
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
                color: "#F0E68C",
                margin: 0,
              }}
            >
              Token ID: {tokenId}
            </p>
          </div>
        </div>

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
              color: "#F0E68C",
              opacity: 0.7,
            }}
          >
            odinscan.fun
          </p>
        </div>
      </div>,
      {
        ...size,
      },
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
