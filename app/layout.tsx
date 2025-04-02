import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'
import Background from "../components/background"
import { Button } from "../components/ui/button"
import type { Metadata } from "next"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Token Detective",
  description: "Whale & Dev Activity Dashboard",
  icons: {
    icon: 'https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png',
    shortcut: 'https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png',
    apple: 'https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://tokendetective.fun',
    title: 'Token Detective',
    description: 'Token Risk Analysis Tool',
    siteName: 'Token Detective',
    images: [
      {
        url: 'https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png',
        width: 1200,
        height: 630,
        alt: 'Token Detective Token Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Detective',
    description: 'Token Risk Analysis Tool',
    images: ['https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("LAYOUT RENDERING")
  
  return (
    <>
      <Head>
        <link rel="icon" href="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png" type="image/x-icon" />
        <link rel="shortcut icon" href="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://tokendetective.fun" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tokendetective.fun" />
        <meta property="og:title" content="Token Detective" />
        <meta property="og:description" content="Token Risk Analysis Tool" />
        <meta property="og:image" content="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png" />
        <meta property="og:site_name" content="Token Detective" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Token Detective" />
        <meta name="twitter:description" content="Token Risk Analysis Tool" />
        <meta name="twitter:image" content="https://i.postimg.cc/s2dq2RZy/image-removebg-preview-1.png" />
      </Head>
      <html lang="en">
        <body style={{ backgroundColor: '#000000' }}>
          <Providers>
            <Background />
            <div style={{ backgroundColor: '#000000' }}>
              {children}
            </div>
          </Providers>
        </body>
      </html>
    </>
  )
}

import './globals.css'
