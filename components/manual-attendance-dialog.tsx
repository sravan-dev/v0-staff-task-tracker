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
import { UserCheck, Loader2 } from "lucide-react"
import { markAttendance } from "@/lib/attendance-actions"

interface ManualAttendanceDialogProps {
  staffList: Array<{
    id: string
    first_name: string
    last_name: string
    employee_id: string
  }>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Marking...
        </>
      ) : (
        "Mark Attendance"
      )}
    </Button>
  )
}

export default function ManualAttendanceDialog({ staffList }: ManualAttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [state, formAction] = useActionState(markAttendance, null)

  // Close dialog on success
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserCheck className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Staff Attendance</DialogTitle>
          <DialogDescription>Manually mark attendance for a staff member.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="staffId">Staff Member *</Label>
            <Select name="staffId" value={selectedStaff} onValueChange={setSelectedStaff} required>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name} ({staff.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" value={selectedStatus} onValueChange={setSelectedStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check In Time</Label>
              <Input id="checkInTime" name="checkInTime" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check Out Time</Label>
              <Input id="checkOutTime" name="checkOutTime" type="time" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
            <Input id="breakDuration" name="breakDuration" type="number" min="0" placeholder="60" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional notes..." rows={3} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
