import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, ClipboardList } from "lucide-react"
import CreateTaskDialog from "./create-task-dialog"
import TaskDetailDialog from "./task-detail-dialog"
import TaskStatusButton from "./task-status-button"

interface TasksSectionProps {
  staffId: string
}

export default async function TasksSection({ staffId }: TasksSectionProps) {
  const supabase = createClient()

  // Get recent tasks for the staff member with comments
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_by:staff_profiles!tasks_assigned_by_fkey(first_name, last_name),
      task_comments(
        id,
        comment,
        created_at,
        staff_profiles(first_name, last_name)
      )
    `)
    .eq("assigned_to", staffId)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get staff list for task creation (managers and admins can assign to anyone)
  const { data: currentUser } = await supabase.from("staff_profiles").select("role").eq("id", staffId).single()

  const { data: staffList } = await supabase
    .from("staff_profiles")
    .select("id, first_name, last_name, employee_id")
    .eq("is_active", true)
    .order("first_name")

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return AlertCircle
      default:
        return Clock
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Tasks</CardTitle>
          {(currentUser?.role === "manager" || currentUser?.role === "admin") && staffList && (
            <CreateTaskDialog staffList={staffList} currentUserId={staffId} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              const PriorityIcon = getPriorityIcon(task.priority)
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    isOverdue ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <TaskStatusButton taskId={task.id} currentStatus={task.status} />
                        {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                      </div>

                      {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <PriorityIcon className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                          <span className="capitalize">{task.priority}</span>
                        </div>

                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {task.estimated_hours && (
                          <div className="flex items-center space-x-1">
                            <span>{task.estimated_hours}h estimated</span>
                          </div>
                        )}

                        {task.task_comments && task.task_comments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>{task.task_comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TaskDetailDialog task={task} comments={task.task_comments} />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks assigned yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
