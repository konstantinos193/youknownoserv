import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://odinscan.fun"

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tokens`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Add more routes as your application grows
  ]
}
