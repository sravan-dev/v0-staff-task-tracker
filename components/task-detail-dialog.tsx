"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, Loader2, MessageSquare, User } from "lucide-react"
import { updateTask, addTaskComment } from "@/lib/task-actions"
import TaskStatusButton from "./task-status-button"

interface TaskDetailDialogProps {
  task: {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    due_date: string | null
    estimated_hours: number | null
    actual_hours: number | null
    created_at: string
    assigned_by: {
      first_name: string
      last_name: string
    } | null
  }
  comments?: Array<{
    id: string
    comment: string
    created_at: string
    staff_profiles: {
      first_name: string
      last_name: string
    }
  }>
}

function UpdateButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Update Task
    </Button>
  )
}

function CommentButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Add Comment
    </Button>
  )
}

export default function TaskDetailDialog({ task, comments = [] }: TaskDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState(task.priority)
  const [updateState, updateAction] = useActionState(updateTask, null)
  const [commentState, commentAction] = useActionState(addTaskComment, null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <TaskStatusButton taskId={task.id} currentStatus={task.status} />
          </DialogTitle>
          <DialogDescription>
            Created {new Date(task.created_at).toLocaleDateString()}
            {task.assigned_by && (
              <span>
                {" "}
                by {task.assigned_by.first_name} {task.assigned_by.last_name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details Form */}
          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="taskId" value={task.id} />

            {updateState?.error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
                {updateState.error}
              </div>
            )}

            {updateState?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded-md text-sm">
                {updateState.success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" name="title" defaultValue={task.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={task.description || ""} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" defaultValue={task.due_date || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  min="1"
                  defaultValue={task.estimated_hours || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHours">Actual Hours</Label>
                <Input
                  id="actualHours"
                  name="actualHours"
                  type="number"
                  min="0"
                  step="0.5"
                  defaultValue={task.actual_hours || ""}
                />
              </div>
            </div>

            <UpdateButton />
          </form>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <form action={commentAction} className="space-y-2">
              <input type="hidden" name="taskId" value={task.id} />

              {commentState?.error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
                  {commentState.error}
                </div>
              )}

              <div className="flex space-x-2">
                <Textarea name="comment" placeholder="Add a comment..." rows={2} className="flex-1" />
                <CommentButton />
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {comment.staff_profiles.first_name} {comment.staff_profiles.last_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No comments yet. Be the first to add one!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
