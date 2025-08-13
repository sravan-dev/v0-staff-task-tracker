import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, Play } from "lucide-react"

export default async function TeamTimeTracking() {
  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  // Get active time sessions
  const { data: activeSessions } = await supabase
    .from("time_sessions")
    .select(`
      *,
      staff_profiles(first_name, last_name),
      task:tasks(title)
    `)
    .eq("is_active", true)
    .order("session_start", { ascending: false })

  // Get today's completed sessions for total hours
  const { data: todaySessions } = await supabase
    .from("time_sessions")
    .select(`
      duration,
      staff_profiles(first_name, last_name)
    `)
    .gte("session_start", `${today}T00:00:00`)
    .lt("session_start", `${today}T23:59:59`)
    .eq("is_active", false)

  // Calculate total hours today
  const totalMinutesToday = todaySessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0
  const totalHoursToday = Math.round((totalMinutesToday / 60) * 10) / 10

  // Group today's sessions by staff
  const staffHours = todaySessions?.reduce(
    (acc, session) => {
      const staffName = `${session.staff_profiles.first_name} ${session.staff_profiles.last_name}`
      if (!acc[staffName]) {
        acc[staffName] = 0
      }
      acc[staffName] += session.duration || 0
      return acc
    },
    {} as Record<string, number>,
  )

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const calculateSessionDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const minutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
    return formatDuration(minutes)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5" />
          <span>Team Time Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{activeSessions?.length || 0}</div>
            <div className="text-sm text-purple-700">Active Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalHoursToday}h</div>
            <div className="text-sm text-green-700">Total Today</div>
          </div>
        </div>

        {/* Active Sessions */}
        {activeSessions && activeSessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Active Sessions</h4>
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <Play className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {session.staff_profiles.first_name} {session.staff_profiles.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{session.task?.title || "General work"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{calculateSessionDuration(session.session_start)}</div>
                    <div className="text-xs text-muted-foreground">
                      Started {new Date(session.session_start).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers Today */}
        {staffHours && Object.keys(staffHours).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Today's Hours</h4>
            <div className="space-y-2">
              {Object.entries(staffHours)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([staffName, minutes]) => (
                  <div key={staffName} className="flex items-center justify-between text-sm">
                    <div className="font-medium">{staffName}</div>
                    <Badge variant="outline">{formatDuration(minutes)}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeSessions?.length === 0 && (!staffHours || Object.keys(staffHours).length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time tracking activity today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
