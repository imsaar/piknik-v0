import { notFound } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getPotluckForAdmin } from "@/lib/data"

interface AdminPageProps {
  params: {
    eventCode: string
  },
  searchParams: {
    token?: string
  }
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const adminToken = searchParams.token;
  
  if (!adminToken) {
    // Handle missing token case - could redirect to a login page or show an error
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Admin Authentication Required</h2>
          <p>You need a valid admin token to access this page.</p>
        </div>
      </div>
    );
  }

  const potluck = await getPotluckForAdmin(params.eventCode, adminToken)

  if (!potluck) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard potluck={potluck} />
    </div>
  )
} 