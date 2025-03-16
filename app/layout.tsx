import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'
import Background from "@/components/background"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Odinsmash",
  description: "Token Risk Analysis Tool",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    url: 'https://odinsmash.com',
    title: 'Odinsmash',
    description: 'Token Risk Analysis Tool',
    siteName: 'Odinsmash',
    images: [
      {
        url: 'https://i.postimg.cc/zBqJ9HdB/ODINSMASH.png',
        width: 1200,
        height: 630,
        alt: 'Odinsmash Token Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odinsmash',
    description: 'Token Risk Analysis Tool',
    images: ['https://i.postimg.cc/zBqJ9HdB/ODINSMASH.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("LAYOUT RENDERING")
  
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://odinsmash.com" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://odinsmash.com" />
        <meta property="og:title" content="Odinsmash" />
        <meta property="og:description" content="Token Risk Analysis Tool" />
        <meta property="og:image" content="https://i.postimg.cc/zBqJ9HdB/ODINSMASH.png" />
        <meta property="og:site_name" content="Odinsmash" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Odinsmash" />
        <meta name="twitter:description" content="Token Risk Analysis Tool" />
        <meta name="twitter:image" content="https://i.postimg.cc/zBqJ9HdB/ODINSMASH.png" />
      </Head>
      <html lang="en">
        <body style={{ backgroundColor: '#000000' }}>
          <Background />
          <div style={{ backgroundColor: '#000000' }}>
            {children}
          </div>
        </body>
      </html>
    </>
  )
}

import './globals.css'