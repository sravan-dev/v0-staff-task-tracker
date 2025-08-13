import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import AdminOverview from "@/components/admin-overview"
import StaffManagement from "@/components/staff-management"
import TeamAttendance from "@/components/team-attendance"
import TaskOverview from "@/components/task-overview"
import TeamTimeTracking from "@/components/team-time-tracking"

export default async function AdminDashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user from the server
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get staff profile and check permissions
  const { data: profile } = await supabase.from("staff_profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">Please contact your administrator to set up your profile.</p>
        </div>
      </div>
    )
  }

  // Check if user has admin/manager permissions
  if (!["manager", "admin"].includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your team and monitor performance</p>
            </div>
          </div>

          {/* Overview Section */}
          <AdminOverview />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <StaffManagement />
              <TaskOverview />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <TeamAttendance />
              <TeamTimeTracking />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
