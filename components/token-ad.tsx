"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { BarChart2 } from "lucide-react"

interface TokenAdProps {
  token?: {
    id: string
    name: string
    tagline: string
    logoColor?: string
    chartUrl?: string
    imageUrl?: string
  }
  className?: string
}

export default function TokenAd({
  token = {
    id: "2jjj",
    name: "ODINDOG",
    tagline: "ODIN'S DOG",
    logoColor: "#00FF00",
    imageUrl: "https://images.odin.fun/token/2jjj",
  },
  className = "",
}: TokenAdProps) {
  // Randomize between a few tokens if none provided
  const [currentToken, setCurrentToken] = useState(token)

  // Sample tokens for rotation if needed
  const sampleTokens = [
    {
      id: "2jjj",
      name: "ODINDOG",
      tagline: "ODIN'S DOG",
      logoColor: "#00FF00",
      imageUrl: "https://images.odin.fun/token/2jjj",
    },
    {
      id: "2",
      name: "404C",
      tagline: "The Coin That Doesn't Exist—Until It Does",
      logoColor: "#00FF00",
      imageUrl: "/path/to/404c-image.png",
    },
  ]

  // Optionally rotate between tokens
  useEffect(() => {
    if (token.name === "RANDOM") {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * sampleTokens.length)
        setCurrentToken(sampleTokens[randomIndex])
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [token.name])

  return (
    <div
      className={`relative rounded-md bg-black border border-border overflow-hidden ${className}`}
      style={{ width: "489px", height: "183px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      <div className="absolute top-2 right-3 text-sm text-muted-foreground font-bold">Ad</div>

      <div className="p-4 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={currentToken.imageUrl}
            alt={currentToken.name}
            className="w-24 h-24 rounded-lg border border-border"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">{currentToken.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{currentToken.tagline}</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full rounded-none border-x-0 border-b-0 h-10 text-sm bg-secondary/50 hover:bg-secondary"
        asChild
      >
        <Link href={`https://odin.fun/token/${currentToken.id}`}>
          <BarChart2 className="h-4 w-4 mr-1" />
          Chart
        </Link>
      </Button>
    </div>
  )
}

