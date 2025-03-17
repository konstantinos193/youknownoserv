import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ExtensionPage() {
  return (
    <div className="min-h-screen font-mono flex items-center justify-center p-4" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <Image 
            src="/Logo.png"
            alt="OdinSmash Logo"
            width={60}
            height={60}
            className="mx-auto rounded-lg"
          />
          <h1 className="mt-4 text-xl font-bold text-primary">OdinSmash Extension</h1>
          <p className="text-xs text-muted-foreground">Real-time token analysis & risk assessment</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 space-y-4">
          {/* Features */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-primary">✓</span>
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">✓</span>
              <span>Risk Indicators</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">✓</span>
              <span>Dev Tracking</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">✓</span>
              <span>Supply Analysis</span>
            </div>
          </div>

          {/* Download Button */}
          <a href="/extension/chrome-extension.crx" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-sm">
              <Download className="mr-2 h-4 w-4" />
              Download Extension
            </Button>
          </a>

          {/* Installation Steps */}
          <div className="space-y-3 text-xs">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
              ⚠️ Chrome may show a security warning - this is normal for developer extensions
            </div>

            <div>
              <p className="font-bold text-primary mb-1">Quick Install:</p>
              <ol className="text-muted-foreground space-y-1 list-decimal pl-4">
                <li>Go to chrome://extensions</li>
                <li>Enable "Developer mode" (top right)</li>
                <li>Extract downloaded files</li>
                <li>Click "Load unpacked" → select folder</li>
              </ol>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center mt-3 text-muted-foreground">
          Compatible with Chrome, Brave, and other Chromium browsers
        </p>
      </div>
    </div>
  )
} 