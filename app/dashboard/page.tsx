import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import StaffOverview from "@/components/staff-overview"
import TasksSection from "@/components/tasks-section"
import AttendanceCard from "@/components/attendance-card"
import TimeTrackingCard from "@/components/time-tracking-card"

export default async function DashboardPage() {
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

  // Get staff profile
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

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", user.id)
    .eq("date", today)
    .single()

  // Get active time session
  const { data: activeSession } = await supabase
    .from("time_sessions")
    .select(`
      *,
      task:tasks(title)
    `)
    .eq("staff_id", user.id)
    .eq("is_active", true)
    .single()

  // Get available tasks for time tracking
  const { data: availableTasks } = await supabase
    .from("tasks")
    .select("id, title, status")
    .eq("assigned_to", user.id)
    .in("status", ["pending", "in_progress"])
    .order("created_at", { ascending: false })

  // Get today's total tracked time
  const { data: todaySessions } = await supabase
    .from("time_sessions")
    .select("duration")
    .eq("staff_id", user.id)
    .gte("session_start", `${today}T00:00:00`)
    .lt("session_start", `${today}T23:59:59`)
    .eq("is_active", false)

  const todayTotalMinutes = todaySessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Overview Section */}
          <StaffOverview staffId={user.id} />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks Section - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <TasksSection staffId={user.id} />
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <AttendanceCard staffId={user.id} attendance={todayAttendance} />
              <TimeTrackingCard
                staffId={user.id}
                activeSession={activeSession}
                availableTasks={availableTasks || []}
                todayTotalMinutes={todayTotalMinutes}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
