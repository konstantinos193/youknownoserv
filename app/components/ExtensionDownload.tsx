'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExtensionDownload() {
  return (
    <Button 
      className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
      onClick={() => {
        window.location.href = '/extension/chrome-extension.crx'
      }}
    >
      <Download className="mr-2 h-4 w-4" />
      Install OdinSmash Extension
    </Button>
  )
} 