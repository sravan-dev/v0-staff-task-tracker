import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, AlertTriangle, Clock } from "lucide-react"

export default async function TaskOverview() {
  const supabase = createClient()

  // Get task statistics
  const { data: allTasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_to_profile:staff_profiles!tasks_assigned_to_fkey(first_name, last_name)
    `)
    .order("created_at", { ascending: false })

  const totalTasks = allTasks?.length || 0
  const pendingTasks = allTasks?.filter((task) => task.status === "pending").length || 0
  const inProgressTasks = allTasks?.filter((task) => task.status === "in_progress").length || 0
  const completedTasks = allTasks?.filter((task) => task.status === "completed").length || 0
  const overdueTasks =
    allTasks?.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed")
      .length || 0

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="h-5 w-5" />
          <span>Task Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            <div className="text-sm text-blue-700">In Progress</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <div className="text-sm text-orange-700">Pending</div>
          </div>
        </div>

        {overdueTasks > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-medium text-red-800">{overdueTasks} Overdue Tasks</div>
              <div className="text-sm text-red-600">Require immediate attention</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Recent Tasks */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Tasks</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allTasks && allTasks.length > 0 ? (
              allTasks.slice(0, 6).map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

                return (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-muted-foreground">
                        Assigned to {task.assigned_to_profile?.first_name} {task.assigned_to_profile?.last_name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)} size="sm">
                        {task.status.replace("_", " ")}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive" size="sm">
                          Overdue
                        </Badge>
                      )}
                      {task.due_date && (
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
