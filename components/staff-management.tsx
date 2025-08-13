import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Settings } from "lucide-react"
import CreateTaskDialog from "./create-task-dialog"
import ManualAttendanceDialog from "./manual-attendance-dialog"

export default async function StaffManagement() {
  const supabase = createClient()

  // Get all staff with their recent activity
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      attendance!attendance_staff_id_fkey(
        date,
        status,
        check_in_time,
        total_hours
      ),
      tasks!tasks_assigned_to_fkey(
        id,
        status
      )
    `)
    .eq("is_active", true)
    .order("first_name")

  const today = new Date().toISOString().split("T")[0]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAttendanceStatus = (attendance: any[]) => {
    const todayAttendance = attendance?.find((a) => a.date === today)
    if (!todayAttendance) return { status: "absent", color: "bg-red-100 text-red-800" }

    switch (todayAttendance.status) {
      case "present":
        return { status: "present", color: "bg-green-100 text-green-800" }
      case "late":
        return { status: "late", color: "bg-yellow-100 text-yellow-800" }
      case "half_day":
        return { status: "half day", color: "bg-blue-100 text-blue-800" }
      default:
        return { status: "absent", color: "bg-red-100 text-red-800" }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Staff Management</span>
          </CardTitle>
          <div className="flex space-x-2">
            {staff && <ManualAttendanceDialog staffList={staff} />}
            {staff && <CreateTaskDialog staffList={staff} currentUserId="" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staff && staff.length > 0 ? (
            staff.map((member) => {
              const initials = `${member.first_name[0]}${member.last_name[0]}`
              const attendanceStatus = getAttendanceStatus(member.attendance)
              const pendingTasks = member.tasks?.filter((task: any) => task.status === "pending").length || 0
              const inProgressTasks = member.tasks?.filter((task: any) => task.status === "in_progress").length || 0

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.employee_id} • {member.position}
                      </div>
                      <div className="text-sm text-muted-foreground">{member.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {pendingTasks + inProgressTasks} active tasks
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge className={attendanceStatus.color}>{attendanceStatus.status}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">Today's status</div>
                    </div>

                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
