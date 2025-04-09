// Add this new file to handle server-side embed image generation
import { type NextRequest, NextResponse } from "next/server"
import { createCanvas, loadImage } from "canvas"

// This would be a server-side API route that generates the embed image
export async function GET(request: NextRequest) {
  try {
    // Get token ID from the URL
    const searchParams = request.nextUrl.searchParams
    const tokenId = searchParams.get("id")

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Fetch token data from your API
    // 2. Generate an image using canvas or another library
    // 3. Return the image as a response

    // Example of how you might generate an image (simplified)
    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext("2d")

    // Draw background
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, 1200, 630)

    // Draw border
    ctx.strokeStyle = "#0FF4C6"
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, 1180, 610)

    // Add token image
    try {
      const tokenImage = await loadImage(`https://images.odin.fun/token/${tokenId}`)
      ctx.drawImage(tokenImage, 50, 50, 200, 200)
    } catch (e) {
      // Use placeholder if image fails to load
      ctx.fillStyle = "#333333"
      ctx.fillRect(50, 50, 200, 200)
    }

    // Add text
    ctx.fillStyle = "#F0E68C" // Yellow color
    ctx.font = "bold 48px Arial"
    ctx.fillText("ODINSCAN Analysis", 280, 100)

    ctx.fillStyle = "#0FF4C6" // Cyan color
    ctx.font = "32px Arial"
    ctx.fillText(`Token ID: ${tokenId}`, 280, 160)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Return the image
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error generating embed:", error)
    return NextResponse.json({ error: "Failed to generate embed" }, { status: 500 })
  }
}
