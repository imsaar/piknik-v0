import { notFound } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getPotluckForAdmin } from "@/lib/data"

interface AdminPageProps {
  params: {
    id: string
  }
}

export default async function AdminPage({ params }: AdminPageProps) {
  const potluck = await getPotluckForAdmin(params.id)

  if (!potluck) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard potluck={potluck} />
    </div>
  )
}

