"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Start a new time tracking session
export async function startTimeSession(prevState: any, formData: FormData) {
  const taskId = formData?.get("taskId")
  const description = formData?.get("description")

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Check if there's already an active session
    const { data: activeSession } = await supabase
      .from("time_sessions")
      .select("id")
      .eq("staff_id", user.id)
      .eq("is_active", true)
      .single()

    if (activeSession) {
      return { error: "You already have an active time session. Please stop it first." }
    }

    const sessionData: any = {
      staff_id: user.id,
      session_start: new Date().toISOString(),
      is_active: true,
      description: description?.toString() || null,
    }

    if (taskId && taskId.toString() !== "") {
      sessionData.task_id = taskId.toString()
    }

    const { error } = await supabase.from("time_sessions").insert(sessionData)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Time tracking started" }
  } catch (error) {
    console.error("Start session error:", error)
    return { error: "Failed to start time session" }
  }
}

// Stop the active time tracking session
export async function stopTimeSession(prevState: any, formData: FormData) {
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

  try {
    // Get the active session
    const { data: activeSession } = await supabase
      .from("time_sessions")
      .select("*")
      .eq("staff_id", user.id)
      .eq("is_active", true)
      .single()

    if (!activeSession) {
      return { error: "No active time session found" }
    }

    const now = new Date().toISOString()
    const updateData: any = {
      session_end: now,
      is_active: false,
    }

    if (notes) {
      updateData.description = notes.toString()
    }

    const { error } = await supabase.from("time_sessions").update(updateData).eq("id", activeSession.id)

    if (error) {
      return { error: error.message }
    }

    // Calculate duration in minutes
    const startTime = new Date(activeSession.session_start)
    const endTime = new Date(now)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    revalidatePath("/dashboard")
    return { success: `Time session stopped. Duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` }
  } catch (error) {
    console.error("Stop session error:", error)
    return { error: "Failed to stop time session" }
  }
}

// Update active session description
export async function updateSessionDescription(description: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("time_sessions")
      .update({ description })
      .eq("staff_id", user.id)
      .eq("is_active", true)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Session description updated" }
  } catch (error) {
    console.error("Update description error:", error)
    return { error: "Failed to update description" }
  }
}

// Switch task for active session
export async function switchSessionTask(taskId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const updateData: any = {}
    if (taskId && taskId !== "") {
      updateData.task_id = taskId
    } else {
      updateData.task_id = null
    }

    const { error } = await supabase
      .from("time_sessions")
      .update(updateData)
      .eq("staff_id", user.id)
      .eq("is_active", true)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Session task updated" }
  } catch (error) {
    console.error("Switch task error:", error)
    return { error: "Failed to switch task" }
  }
}

// Create manual time entry
export async function createManualTimeEntry(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const taskId = formData.get("taskId")
  const date = formData.get("date")
  const startTime = formData.get("startTime")
  const endTime = formData.get("endTime")
  const description = formData.get("description")

  if (!date || !startTime || !endTime) {
    return { error: "Date, start time, and end time are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const sessionStart = `${date}T${startTime}:00`
    const sessionEnd = `${date}T${endTime}:00`

    // Validate times
    const start = new Date(sessionStart)
    const end = new Date(sessionEnd)

    if (end <= start) {
      return { error: "End time must be after start time" }
    }

    const sessionData: any = {
      staff_id: user.id,
      session_start: sessionStart,
      session_end: sessionEnd,
      is_active: false,
      description: description?.toString() || null,
    }

    if (taskId && taskId.toString() !== "") {
      sessionData.task_id = taskId.toString()
    }

    const { error } = await supabase.from("time_sessions").insert(sessionData)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Manual time entry created successfully" }
  } catch (error) {
    console.error("Manual entry error:", error)
    return { error: "Failed to create manual time entry" }
  }
}
