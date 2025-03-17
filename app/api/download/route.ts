import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'extension', 'odinsmash-extension.crx')
  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/x-chrome-extension',
      'Content-Disposition': 'attachment; filename=odinsmash-extension.crx'
    }
  })
} 