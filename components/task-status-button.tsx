"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Play, Pause, CheckCircle2, X } from "lucide-react"
import { updateTaskStatus } from "@/lib/task-actions"
import { useTransition } from "react"

interface TaskStatusButtonProps {
  taskId: string
  currentStatus: string
}

export default function TaskStatusButton({ taskId, currentStatus }: TaskStatusButtonProps) {
  const [isPending, startTransition] = useTransition()

  const statusOptions = [
    { value: "pending", label: "Pending", icon: Pause, color: "bg-orange-100 text-orange-800" },
    { value: "in_progress", label: "In Progress", icon: Play, color: "bg-blue-100 text-blue-800" },
    { value: "completed", label: "Completed", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", icon: X, color: "bg-gray-100 text-gray-800" },
  ]

  const currentStatusOption = statusOptions.find((option) => option.value === currentStatus)

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          <Badge className={currentStatusOption?.color}>{currentStatusOption?.label || currentStatus}</Badge>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={option.value === currentStatus}
            >
              <Icon className="h-4 w-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
