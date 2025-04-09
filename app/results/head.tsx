// Add this file to include OpenGraph meta tags for better embeds
export default function Head({ params }: { params: { id: string } }) {
  // In a real implementation, you would fetch token data here
  // For demo purposes, we'll use placeholder values
  const title = "Token Analysis | ODINSCAN"
  const description = "Analyze Odin.fun tokens for risk assessment and detailed metrics"
  const imageUrl = `https://api.odinscan.com/embed/token?id=${params.id}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph tags for social sharing */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content="website" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  )
}
