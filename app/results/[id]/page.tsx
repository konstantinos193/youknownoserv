import type { Metadata } from "next"
import ResultsPage from "@/app/results/page"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id

  // You could fetch token data here to use in the metadata
  // const token = await fetch(`https://api.odinscan.fun/token/${id}`).then(res => res.json())

  return {
    title: `Token ${id} Analysis | ODINSCAN`,
    description: `Detailed risk assessment and metrics for token ${id} on Odin.fun`,
    openGraph: {
      title: `Token ${id} Analysis | ODINSCAN`,
      description: `Detailed risk assessment and metrics for token ${id} on Odin.fun`,
      images: [
        {
          url: `/api/og?token=${id}`,
          width: 1200,
          height: 630,
          alt: `Token ${id} Analysis`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Token ${id} Analysis | ODINSCAN`,
      description: `Detailed risk assessment and metrics for token ${id} on Odin.fun`,
      images: [`/api/og?token=${id}`],
    },
  }
}

export default function TokenPage({ params }: Props) {
  // This is a wrapper that passes the ID to the results page
  return <ResultsPage searchParam={params.id} />
}
