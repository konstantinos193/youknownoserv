"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Shield, Activity, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      // Prevent scrolling when menu is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300">
      <div
        ref={navRef}
        className="fixed right-0 top-0 h-full w-72 bg-black p-6 shadow-xl transition-transform duration-300 ease-in-out border-l border-cyan-600/20"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Image
              src="https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png"
              alt="ODINSCAN Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h2 className="ml-2 text-xl font-bold text-yellow-300">ODINSCAN</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-cyan-500 hover:text-cyan-400">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex flex-col space-y-6">
          <Link
            href="/"
            className="text-yellow-300 hover:text-yellow-200 text-lg font-medium transition-colors flex items-center"
            onClick={onClose}
          >
            <Shield className="w-5 h-5 mr-3 text-cyan-400" />
            HOME
          </Link>
          <Link
            href="/tokens"
            className="text-yellow-300/80 hover:text-yellow-300 text-lg font-medium transition-colors flex items-center"
            onClick={onClose}
          >
            <Activity className="w-5 h-5 mr-3 text-cyan-400" />
            TOKENS
          </Link>
          <div className="relative inline-block">
            <span className="text-yellow-300/50 cursor-not-allowed text-lg font-medium flex items-center">
              <Waves className="w-5 h-5 mr-3 text-cyan-400/40" />
              WHALE ACTIVITY
            </span>
            <div className="absolute -top-3 right-0 bg-yellow-300 text-black px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              Soon
            </div>
          </div>
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <Link
            href="https://odin.fun/token/2ev1"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-cyan-500 hover:bg-cyan-600 text-black py-3 rounded-md text-center font-semibold transition-colors"
            onClick={onClose}
          >
            BUY TOKEN
          </Link>
        </div>
      </div>
    </div>
  )
}
