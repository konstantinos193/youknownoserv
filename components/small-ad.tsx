// components/small-ad.tsx
"use client"

import React from "react"
import Link from "next/link"
import { BarChart2 } from "lucide-react"

interface SmallAdProps {
  token: {
    id: string
    name: string
    imageUrl: string
  }
}

export default function SmallAd({ token }: SmallAdProps) {
  return (
    <div className="relative w-32 h-32 bg-black border border-border rounded-md overflow-hidden">
      <img
        src={token.imageUrl}
        alt={token.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1 right-1 text-xs text-white bg-black/70 px-1 rounded">
        Ad
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white flex justify-between items-center">
        <span>{token.name}</span>
        <Link href={`https://odin.fun/token/${token.id}`}>
          <BarChart2 className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}