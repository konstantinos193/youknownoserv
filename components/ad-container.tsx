"use client"
import TokenAd from "@/components/token-ad"
import { useEffect, useState } from "react"

interface AdContainerProps {
  position?: "sidebar" | "inline" | "footer"
  maxAds?: number
  className?: string
}

interface Token {
  id: string
  name: string
  tagline: string
  logoColor: string
  imageUrl: string
  url: string
}

export default function AdContainer({ position = "sidebar", maxAds = 1, className = "" }: AdContainerProps) {
  const [adTokens, setAdTokens] = useState<Token[]>([])

  useEffect(() => {
    fetch("/tokens.json")
      .then((response) => response.json())
      .then((data) => {
        // Shuffle the tokens array
        const shuffledTokens = data.sort(() => 0.5 - Math.random())
        setAdTokens(shuffledTokens)
      })
      .catch((error) => console.error("Error fetching tokens:", error))
  }, [])

  const displayAds = adTokens.slice(0, maxAds)

  // Different layout styles based on position
  const getContainerClasses = () => {
    switch (position) {
      case "sidebar":
        return "flex flex-col gap-3"
      case "inline":
        return "flex flex-wrap gap-3"
      case "footer":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      default:
        return "flex flex-col gap-3"
    }
  }

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {displayAds.map((token) => (
        <TokenAd key={token.id} token={token} />
      ))}
    </div>
  )
}

