import { notFound } from "next/navigation"
import { ParticipantView } from "@/components/participant-view"
import { getPotluckForParticipant } from "@/lib/data"

interface PotluckPageProps {
  params: {
    eventCode: string
  }
}

export default async function PotluckPage({ params }: PotluckPageProps) {
  const potluck = await getPotluckForParticipant(params.eventCode)

  if (!potluck) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ParticipantView potluck={potluck} />
    </div>
  )
} 