import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, CheckCircle, Clock, Calendar } from "lucide-react"

interface StaffOverviewProps {
  staffId: string
}

export default async function StaffOverview({ staffId }: StaffOverviewProps) {
  const supabase = createClient()

  // Get dashboard summary using the database function
  const { data: summary } = await supabase.rpc("get_staff_dashboard_summary", {
    staff_uuid: staffId,
  })

  const stats = [
    {
      title: "Pending Tasks",
      value: summary?.pending_tasks || 0,
      icon: ClipboardList,
      color: "text-orange-600",
    },
    {
      title: "In Progress",
      value: summary?.in_progress_tasks || 0,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Completed Today",
      value: summary?.completed_tasks_today || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Hours Today",
      value: summary?.total_hours_today ? `${summary.total_hours_today}h` : "0h",
      icon: Calendar,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
