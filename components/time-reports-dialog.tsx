"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Clock, Target } from "lucide-react"

interface TimeSession {
  id: string
  session_start: string
  session_end: string | null
  duration: number | null
  description: string | null
  task?: {
    title: string
    status: string
  }
}

interface TimeReportsDialogProps {
  timeSessions: TimeSession[]
  trigger?: React.ReactNode
}

export default function TimeReportsDialog({ timeSessions, trigger }: TimeReportsDialogProps) {
  const [open, setOpen] = useState(false)

  // Calculate statistics
  const completedSessions = timeSessions.filter((session) => session.session_end && session.duration)
  const totalMinutes = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  // Group sessions by date
  const sessionsByDate = completedSessions.reduce(
    (acc, session) => {
      const date = new Date(session.session_start).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    },
    {} as Record<string, TimeSession[]>,
  )

  // Group sessions by task
  const sessionsByTask = completedSessions.reduce(
    (acc, session) => {
      const taskTitle = session.task?.title || "No Task"
      if (!acc[taskTitle]) {
        acc[taskTitle] = { sessions: [], totalMinutes: 0 }
      }
      acc[taskTitle].sessions.push(session)
      acc[taskTitle].totalMinutes += session.duration || 0
      return acc
    },
    {} as Record<string, { sessions: TimeSession[]; totalMinutes: number }>,
  )

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Time Reports
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Time Tracking Reports</DialogTitle>
          <DialogDescription>Your time tracking statistics and detailed reports</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="tasks">By Task</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{totalHours}h</div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{completedSessions.length}</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{session.task?.title || "General Work"}</div>
                        {session.description && (
                          <div className="text-sm text-muted-foreground">{session.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.session_start).toLocaleDateString()} at{" "}
                          {new Date(session.session_start).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatDuration(session.duration || 0)}</div>
                        {session.task && (
                          <Badge className={getTaskStatusColor(session.task.status)} size="sm">
                            {session.task.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {completedSessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No completed time sessions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(sessionsByDate)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, sessions]) => {
                  const dayTotal = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
                  return (
                    <Card key={date}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{date}</CardTitle>
                          <Badge variant="outline">{formatDuration(dayTotal)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between text-sm">
                              <div className="flex-1">
                                <div className="font-medium">{session.task?.title || "General Work"}</div>
                                {session.description && (
                                  <div className="text-muted-foreground">{session.description}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div>{formatDuration(session.duration || 0)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(session.session_start).toLocaleTimeString()} -{" "}
                                  {session.session_end && new Date(session.session_end).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(sessionsByTask)
                .sort(([, a], [, b]) => b.totalMinutes - a.totalMinutes)
                .map(([taskTitle, { sessions, totalMinutes }]) => (
                  <Card key={taskTitle}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{taskTitle}</CardTitle>
                        <Badge variant="outline">{formatDuration(totalMinutes)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                        </div>
                        {sessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              {session.description && (
                                <div className="text-muted-foreground">{session.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(session.session_start).toLocaleDateString()}
                              </div>
                            </div>
                            <div>{formatDuration(session.duration || 0)}</div>
                          </div>
                        ))}
                        {sessions.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{sessions.length - 3} more sessions
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
