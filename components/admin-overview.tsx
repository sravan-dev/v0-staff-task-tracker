import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export default async function AdminOverview() {
  const supabase = createClient()

  // Get dashboard summary using the database function
  const { data: summary } = await supabase.rpc("get_manager_dashboard_summary")

  const today = new Date().toISOString().split("T")[0]

  // Get additional metrics
  const { data: activeTimeSessions } = await supabase.from("time_sessions").select("id").eq("is_active", true)

  const { data: todayTasks } = await supabase
    .from("tasks")
    .select("status")
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`)

  const todayCompletedTasks = todayTasks?.filter((task) => task.status === "completed").length || 0

  const stats = [
    {
      title: "Total Staff",
      value: summary?.total_staff || 0,
      icon: Users,
      color: "text-blue-600",
      description: "Active employees",
    },
    {
      title: "Present Today",
      value: summary?.present_today || 0,
      icon: CheckCircle,
      color: "text-green-600",
      description: "Checked in today",
    },
    {
      title: "Pending Tasks",
      value: summary?.pending_tasks || 0,
      icon: ClipboardList,
      color: "text-orange-600",
      description: "Awaiting completion",
    },
    {
      title: "Overdue Tasks",
      value: summary?.overdue_tasks || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Past due date",
    },
    {
      title: "Active Sessions",
      value: activeTimeSessions?.length || 0,
      icon: Clock,
      color: "text-purple-600",
      description: "Currently tracking time",
    },
    {
      title: "Completed Today",
      value: todayCompletedTasks,
      icon: TrendingUp,
      color: "text-emerald-600",
      description: "Tasks finished today",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
