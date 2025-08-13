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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Coffee } from "lucide-react"

interface AttendanceRecord {
  id: string
  date: string
  check_in_time: string | null
  check_out_time: string | null
  status: string
  break_duration: number
  total_hours: number | null
  notes: string | null
}

interface AttendanceHistoryDialogProps {
  attendanceRecords: AttendanceRecord[]
  trigger?: React.ReactNode
}

export default function AttendanceHistoryDialog({ attendanceRecords, trigger }: AttendanceHistoryDialogProps) {
  const [open, setOpen] = useState(false)

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

  const totalHoursThisWeek = attendanceRecords
    .filter((record) => {
      const recordDate = new Date(record.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return recordDate >= weekAgo
    })
    .reduce((sum, record) => sum + (record.total_hours || 0), 0)

  const totalHoursThisMonth = attendanceRecords
    .filter((record) => {
      const recordDate = new Date(record.date)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return recordDate >= monthAgo
    })
    .reduce((sum, record) => sum + (record.total_hours || 0), 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            View Attendance History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance History</DialogTitle>
          <DialogDescription>Your attendance records and statistics</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(totalHoursThisWeek * 10) / 10}h</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(totalHoursThisMonth * 10) / 10}h</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Records */}
          <div className="space-y-3">
            <h3 className="font-semibold">Recent Records</h3>
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{new Date(record.date).toLocaleDateString()}</div>
                      <Badge className={getStatusColor(record.status)}>{record.status.replace("_", " ")}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        {record.check_in_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>In: {new Date(record.check_in_time).toLocaleTimeString()}</span>
                          </div>
                        )}
                        {record.check_out_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>Out: {new Date(record.check_out_time).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        {record.break_duration > 0 && (
                          <div className="flex items-center space-x-2">
                            <Coffee className="h-3 w-3" />
                            <span>Break: {record.break_duration}m</span>
                          </div>
                        )}
                        {record.total_hours && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>Total: {record.total_hours}h</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
