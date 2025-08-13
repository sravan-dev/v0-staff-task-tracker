"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play, Square, Timer, Loader2, Edit, BarChart3 } from "lucide-react"
import {
  startTimeSession,
  stopTimeSession,
  switchSessionTask,
  updateSessionDescription,
} from "@/lib/time-tracking-actions"

interface TimeTrackingCardProps {
  staffId: string
  activeSession?: {
    id: string
    session_start: string
    task_id: string | null
    description: string | null
    task?: {
      title: string
    }
  } | null
  availableTasks?: Array<{
    id: string
    title: string
    status: string
  }>
  todayTotalMinutes?: number
}

function StartButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Start Timer
        </>
      )}
    </Button>
  )
}

function StopButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Stopping...
        </>
      ) : (
        <>
          <Square className="h-4 w-4 mr-2" />
          Stop Timer
        </>
      )}
    </Button>
  )
}

export default function TimeTrackingCard({
  staffId,
  activeSession,
  availableTasks = [],
  todayTotalMinutes = 0,
}: TimeTrackingCardProps) {
  const [startState, startAction] = useActionState(startTimeSession, null)
  const [stopState, stopAction] = useActionState(stopTimeSession, null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState("defaultTaskId")
  const [currentDuration, setCurrentDuration] = useState(0)
  const [editingDescription, setEditingDescription] = useState(false)
  const [tempDescription, setTempDescription] = useState("")

  // Calculate current session duration
  useEffect(() => {
    if (!activeSession) return

    const updateDuration = () => {
      const start = new Date(activeSession.session_start)
      const now = new Date()
      const minutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
      setCurrentDuration(minutes)
    }

    updateDuration()
    const interval = setInterval(updateDuration, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [activeSession])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleTaskSwitch = async (taskId: string) => {
    await switchSessionTask(taskId)
  }

  const handleDescriptionUpdate = async () => {
    if (tempDescription.trim()) {
      await updateSessionDescription(tempDescription.trim())
    }
    setEditingDescription(false)
  }

  const todayTotalHours = Math.round((todayTotalMinutes / 60) * 10) / 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5" />
          <span>Time Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display any action messages */}
        {startState?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
            {startState.error}
          </div>
        )}
        {startState?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-3 py-2 rounded-md text-sm">
            {startState.success}
          </div>
        )}
        {stopState?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
            {stopState.error}
          </div>
        )}
        {stopState?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-3 py-2 rounded-md text-sm">
            {stopState.success}
          </div>
        )}

        {activeSession ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className="bg-green-100 text-green-800">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration</span>
              <span className="text-lg font-bold text-green-600">{formatDuration(currentDuration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Started</span>
              <span className="text-sm">{new Date(activeSession.session_start).toLocaleTimeString()}</span>
            </div>

            {/* Task Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Task</Label>
              <Select value={activeSession.task_id || "defaultTaskId"} onValueChange={handleTaskSwitch}>
                <SelectTrigger>
                  <SelectValue placeholder="No task selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultTaskId">No specific task</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Description</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTempDescription(activeSession.description || "")
                    setEditingDescription(true)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              {editingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="What are you working on?"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleDescriptionUpdate}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingDescription(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {activeSession.description || "No description"}
                </p>
              )}
            </div>

            <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stop Time Session</DialogTitle>
                  <DialogDescription>Session duration: {formatDuration(currentDuration)}</DialogDescription>
                </DialogHeader>
                <form action={stopAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Final Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Add any final notes about this session..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowStopDialog(false)}>
                      Cancel
                    </Button>
                    <StopButton />
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">No active time session</p>

              <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Timer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Time Session</DialogTitle>
                    <DialogDescription>Begin tracking your work time</DialogDescription>
                  </DialogHeader>
                  <form action={startAction} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskId">Task (optional)</Label>
                      <Select name="taskId" value={selectedTask} onValueChange={setSelectedTask}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task or leave blank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defaultTaskId">No specific task</SelectItem>
                          {availableTasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="What will you be working on?"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowStartDialog(false)}>
                        Cancel
                      </Button>
                      <StartButton />
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Total</span>
            <span className="text-sm font-bold">{todayTotalHours}h</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Time Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
