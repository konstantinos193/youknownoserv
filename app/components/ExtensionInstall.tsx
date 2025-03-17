'use client'

export function handleExtensionInstall() {
  if (chrome?.webstore?.install) {
    chrome.webstore.install(
      undefined,
      () => {
        alert('OdinSmash has been installed successfully!')
      },
      (error) => {
        // Fallback to direct download if Chrome Web Store installation fails
        window.location.href = '/extension/odinsmash-extension.crx'
      }
    )
  } else {
    // Direct download for other browsers
    window.location.href = '/extension/odinsmash-extension.crx'
  }
} 