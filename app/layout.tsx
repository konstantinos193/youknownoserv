import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Odinsmash",
  description: "Token Risk Analysis Tool",
  openGraph: {
    type: 'website',
    url: 'https://odinsmash.com',
    title: 'Odinsmash',
    description: 'Token Risk Analysis Tool',
    siteName: 'Odinsmash',
    images: [
      {
        url: '/og-image.png', // You'll need to add your own OG image
        width: 1200,
        height: 630,
        alt: 'Odinsmash Token Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odinsmash',
    description: 'Odinsmash Token Analyzer',
    images: [''],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="f" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="" />
        <meta property="og:title" content="Odinsmash" />
        <meta property="og:description" content="Odinsmash Token Analyzer" />
        <meta property="og:image" content="" />
        <meta property="og:site_name" content="Odinsmash" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Odinsmash" />
        <meta name="twitter:description" content="Odinsmash Token Analyzer" />
        <meta name="twitter:image" content="" />
      </Head>
      <html lang="en">
        <body className={`${inter.className} dream-bg`}>
          {children}
        </body>
      </html>
    </>
  )
}



import './globals.css'