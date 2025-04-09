import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

// Define base URL for absolute URLs
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://odinscan.fun"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "ODINSCAN - Token Analysis Tool",
  description: "Analyze tokens on Odin.fun with advanced risk assessment and holder analysis",
  keywords: ["odin", "token", "cryptocurrency", "analysis", "risk assessment", "blockchain", "crypto"],
  authors: [{ name: "ODINSCAN Team" }],
  creator: "ODINSCAN",
  publisher: "ODINSCAN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  applicationName: "ODINSCAN",
  category: "Finance",

  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "ODINSCAN - Token Analysis Tool",
    description: "Analyze tokens on Odin.fun with advanced risk assessment and holder analysis",
    siteName: "ODINSCAN",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ODINSCAN - Token Analysis Tool",
      },
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "ODINSCAN - Token Analysis Tool",
    description: "Analyze tokens on Odin.fun with advanced risk assessment and holder analysis",
    creator: "@odinscan",
    images: [`${baseUrl}/twitter-image.png`],
  },

  // Discord metadata (uses Open Graph)
  // Discord will use the Open Graph metadata for rich embeds

  // Verification for search engines (add your verification codes when available)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }, { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  // Web manifest
  manifest: `${baseUrl}/manifest.json`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
