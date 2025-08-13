"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Create a new task
export async function createTask(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const title = formData.get("title")
  const description = formData.get("description")
  const assignedTo = formData.get("assignedTo")
  const priority = formData.get("priority")
  const dueDate = formData.get("dueDate")
  const estimatedHours = formData.get("estimatedHours")

  if (!title || !assignedTo) {
    return { error: "Title and assigned staff are required" }
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
    const { error } = await supabase.from("tasks").insert({
      title: title.toString(),
      description: description?.toString() || null,
      assigned_to: assignedTo.toString(),
      assigned_by: user.id,
      priority: priority?.toString() || "medium",
      due_date: dueDate?.toString() || null,
      estimated_hours: estimatedHours ? Number.parseInt(estimatedHours.toString()) : null,
      status: "pending",
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Task created successfully" }
  } catch (error) {
    console.error("Task creation error:", error)
    return { error: "Failed to create task" }
  }
}

// Update task status
export async function updateTaskStatus(taskId: string, status: string) {
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
    const updateData: any = { status }

    // If marking as completed, set completed_at timestamp
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("tasks").update(updateData).eq("id", taskId).eq("assigned_to", user.id) // Only allow updating own tasks

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Task status updated" }
  } catch (error) {
    console.error("Task update error:", error)
    return { error: "Failed to update task" }
  }
}

// Add comment to task
export async function addTaskComment(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const taskId = formData.get("taskId")
  const comment = formData.get("comment")

  if (!taskId || !comment) {
    return { error: "Task ID and comment are required" }
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
    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId.toString(),
      staff_id: user.id,
      comment: comment.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Comment added successfully" }
  } catch (error) {
    console.error("Comment creation error:", error)
    return { error: "Failed to add comment" }
  }
}

// Update task details
export async function updateTask(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const taskId = formData.get("taskId")
  const title = formData.get("title")
  const description = formData.get("description")
  const priority = formData.get("priority")
  const dueDate = formData.get("dueDate")
  const estimatedHours = formData.get("estimatedHours")
  const actualHours = formData.get("actualHours")

  if (!taskId || !title) {
    return { error: "Task ID and title are required" }
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
    const { error } = await supabase
      .from("tasks")
      .update({
        title: title.toString(),
        description: description?.toString() || null,
        priority: priority?.toString() || "medium",
        due_date: dueDate?.toString() || null,
        estimated_hours: estimatedHours ? Number.parseInt(estimatedHours.toString()) : null,
        actual_hours: actualHours ? Number.parseInt(actualHours.toString()) : null,
      })
      .eq("id", taskId.toString())
      .eq("assigned_to", user.id) // Only allow updating own tasks

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Task updated successfully" }
  } catch (error) {
    console.error("Task update error:", error)
    return { error: "Failed to update task" }
  }
}
