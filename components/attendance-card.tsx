"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, LogIn, LogOut, Loader2, Calendar } from "lucide-react"
import { checkIn, checkOut, updateBreakDuration } from "@/lib/attendance-actions"

interface AttendanceCardProps {
  staffId: string
  attendance?: {
    id: string
    date: string
    check_in_time: string | null
    check_out_time: string | null
    status: string
    break_duration: number
    total_hours: number | null
    notes: string | null
  } | null
}

function CheckInButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking in...
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </>
      )}
    </Button>
  )
}

function CheckOutButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Check Out
        </>
      )}
    </Button>
  )
}

export default function AttendanceCard({ staffId, attendance }: AttendanceCardProps) {
  const [checkInState, checkInAction] = useActionState(checkIn, null)
  const [checkOutState, checkOutAction] = useActionState(checkOut, null)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [breakMinutes, setBreakMinutes] = useState(attendance?.break_duration || 0)

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

  const handleBreakUpdate = async (minutes: number) => {
    setBreakMinutes(minutes)
    await updateBreakDuration(minutes)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Today's Attendance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display any action messages */}
        {checkInState?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
            {checkInState.error}
          </div>
        )}
        {checkInState?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-3 py-2 rounded-md text-sm">
            {checkInState.success}
          </div>
        )}
        {checkOutState?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded-md text-sm">
            {checkOutState.error}
          </div>
        )}
        {checkOutState?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-3 py-2 rounded-md text-sm">
            {checkOutState.success}
          </div>
        )}

        {attendance ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(attendance.status)}>{attendance.status.replace("_", " ")}</Badge>
            </div>

            {attendance.check_in_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check In</span>
                <span className="text-sm">{new Date(attendance.check_in_time).toLocaleTimeString()}</span>
              </div>
            )}

            {attendance.check_out_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check Out</span>
                <span className="text-sm">{new Date(attendance.check_out_time).toLocaleTimeString()}</span>
              </div>
            )}

            {/* Break Duration Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Break Time</span>
                <span className="text-sm">{breakMinutes} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBreakUpdate(Math.max(0, breakMinutes - 15))}
                  disabled={breakMinutes <= 0}
                >
                  -15m
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBreakUpdate(breakMinutes + 15)}>
                  +15m
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBreakUpdate(breakMinutes + 30)}>
                  +30m
                </Button>
              </div>
            </div>

            {attendance.total_hours && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Hours</span>
                <span className="text-sm font-bold">{attendance.total_hours}h</span>
              </div>
            )}

            {attendance.notes && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Notes</span>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{attendance.notes}</p>
              </div>
            )}

            <div className="pt-2">
              {!attendance.check_out_time ? (
                <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Check Out</DialogTitle>
                      <DialogDescription>Add any notes about your day before checking out.</DialogDescription>
                    </DialogHeader>
                    <form action={checkOutAction} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea id="notes" name="notes" placeholder="Any notes about your work today..." rows={3} />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowCheckOutDialog(false)}>
                          Cancel
                        </Button>
                        <CheckOutButton />
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="text-center text-sm text-muted-foreground">Day completed</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">You haven't checked in today</p>
              <form action={checkInAction}>
                <CheckInButton />
              </form>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            View Attendance History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
