import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock } from "lucide-react"

export default async function TeamAttendance() {
  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  // Get today's attendance data
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      staff_profiles(first_name, last_name, employee_id)
    `)
    .eq("date", today)
    .order("check_in_time", { ascending: true })

  // Get total staff count
  const { data: totalStaff } = await supabase.from("staff_profiles").select("id").eq("is_active", true)

  const totalStaffCount = totalStaff?.length || 0
  const presentCount = todayAttendance?.filter((a) => a.status === "present").length || 0
  const lateCount = todayAttendance?.filter((a) => a.status === "late").length || 0
  const absentCount = totalStaffCount - (todayAttendance?.length || 0)

  const attendanceRate = totalStaffCount > 0 ? Math.round((presentCount / totalStaffCount) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "half_day":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Team Attendance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attendance Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <div className="text-sm text-green-700">Present</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            <div className="text-sm text-yellow-700">Late</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Attendance Rate</span>
            <span>{attendanceRate}%</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Check-ins</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todayAttendance && todayAttendance.length > 0 ? (
              todayAttendance.slice(0, 8).map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">
                      {attendance.staff_profiles.first_name} {attendance.staff_profiles.last_name}
                    </div>
                    <Badge className={getStatusColor(attendance.status)} size="sm">
                      {attendance.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    {attendance.check_in_time && (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(attendance.check_in_time).toLocaleTimeString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No attendance records for today</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
