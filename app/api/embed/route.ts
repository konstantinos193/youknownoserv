// Add this new file to handle server-side embed image generation
import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

// This would be a server-side API route that generates the embed image
export async function GET(request: NextRequest) {
  try {
    // Get token ID from the URL
    const searchParams = request.nextUrl.searchParams
    const tokenId = searchParams.get("id")

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    // Create a simple SVG template
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#000000"/>
        <rect x="10" y="10" width="1180" height="610" fill="none" stroke="#0FF4C6" stroke-width="4"/>
        <text x="280" y="100" font-family="Arial" font-size="48" font-weight="bold" fill="#F0E68C">ODINSCAN Analysis</text>
        <text x="280" y="160" font-family="Arial" font-size="32" fill="#0FF4C6">Token ID: ${tokenId}</text>
      </svg>
    `

    // Convert SVG to PNG using sharp
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

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
