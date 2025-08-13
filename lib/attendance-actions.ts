"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Check in for the day
export async function checkIn(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const today = new Date().toISOString().split("T")[0]
  const now = new Date().toISOString()

  try {
    // Check if already checked in today
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("staff_id", user.id)
      .eq("date", today)
      .single()

    if (existingAttendance) {
      return { error: "You have already checked in today" }
    }

    // Determine if late (assuming work starts at 9 AM)
    const workStartTime = new Date(`${today}T09:00:00`)
    const checkInTime = new Date(now)
    const isLate = checkInTime > workStartTime
    const status = isLate ? "late" : "present"

    const { error } = await supabase.from("attendance").insert({
      staff_id: user.id,
      date: today,
      check_in_time: now,
      status: status,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: `Checked in successfully${isLate ? " (marked as late)" : ""}` }
  } catch (error) {
    console.error("Check-in error:", error)
    return { error: "Failed to check in" }
  }
}

// Check out for the day
export async function checkOut(prevState: any, formData: FormData) {
  const notes = formData?.get("notes")

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const today = new Date().toISOString().split("T")[0]
  const now = new Date().toISOString()

  try {
    // Get today's attendance record
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("staff_id", user.id)
      .eq("date", today)
      .single()

    if (!attendance) {
      return { error: "No check-in record found for today" }
    }

    if (attendance.check_out_time) {
      return { error: "You have already checked out today" }
    }

    const updateData: any = {
      check_out_time: now,
    }

    if (notes) {
      updateData.notes = notes.toString()
    }

    const { error } = await supabase.from("attendance").update(updateData).eq("id", attendance.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Checked out successfully" }
  } catch (error) {
    console.error("Check-out error:", error)
    return { error: "Failed to check out" }
  }
}

// Update break duration
export async function updateBreakDuration(breakMinutes: number) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const today = new Date().toISOString().split("T")[0]

  try {
    const { error } = await supabase
      .from("attendance")
      .update({ break_duration: breakMinutes })
      .eq("staff_id", user.id)
      .eq("date", today)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Break duration updated" }
  } catch (error) {
    console.error("Break update error:", error)
    return { error: "Failed to update break duration" }
  }
}

// Mark attendance manually (for managers/admins)
export async function markAttendance(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const staffId = formData.get("staffId")
  const date = formData.get("date")
  const status = formData.get("status")
  const checkInTime = formData.get("checkInTime")
  const checkOutTime = formData.get("checkOutTime")
  const breakDuration = formData.get("breakDuration")
  const notes = formData.get("notes")

  if (!staffId || !date || !status) {
    return { error: "Staff, date, and status are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user and verify they're a manager/admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: currentUser } = await supabase.from("staff_profiles").select("role").eq("id", user.id).single()

  if (!currentUser || !["manager", "admin"].includes(currentUser.role)) {
    return { error: "Insufficient permissions" }
  }

  try {
    const attendanceData: any = {
      staff_id: staffId.toString(),
      date: date.toString(),
      status: status.toString(),
      break_duration: breakDuration ? Number.parseInt(breakDuration.toString()) : 0,
      notes: notes?.toString() || null,
    }

    if (checkInTime) {
      attendanceData.check_in_time = `${date}T${checkInTime}:00`
    }

    if (checkOutTime) {
      attendanceData.check_out_time = `${date}T${checkOutTime}:00`
    }

    // Try to update existing record first, then insert if not found
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("staff_id", staffId.toString())
      .eq("date", date.toString())
      .single()

    if (existing) {
      const { error } = await supabase.from("attendance").update(attendanceData).eq("id", existing.id)
      if (error) {
        return { error: error.message }
      }
    } else {
      const { error } = await supabase.from("attendance").insert(attendanceData)
      if (error) {
        return { error: error.message }
      }
    }

    revalidatePath("/dashboard")
    return { success: "Attendance marked successfully" }
  } catch (error) {
    console.error("Mark attendance error:", error)
    return { error: "Failed to mark attendance" }
  }
}
