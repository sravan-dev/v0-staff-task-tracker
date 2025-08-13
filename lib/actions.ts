"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign up action with staff profile creation
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const employeeId = formData.get("employeeId")
  const department = formData.get("department")
  const position = formData.get("position")

  if (!email || !password || !firstName || !lastName || !employeeId) {
    return { error: "All required fields must be filled" }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    // If user was created, create their staff profile
    if (data.user) {
      const { error: profileError } = await supabase.from("staff_profiles").insert({
        id: data.user.id,
        employee_id: employeeId.toString(),
        first_name: firstName.toString(),
        last_name: lastName.toString(),
        email: email.toString(),
        department: department?.toString() || null,
        position: position?.toString() || null,
        role: "staff",
        hire_date: new Date().toISOString().split("T")[0],
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Account created but profile setup failed. Please contact admin." }
      }
    }

    return { success: "Account created successfully! Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createDefaultAdmin() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  try {
    const { data: tables, error: schemaError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "staff_profiles")

    if (schemaError || !tables || tables.length === 0) {
      return {
        error: `DATABASE SETUP REQUIRED

The database tables haven't been created yet. Please run these scripts in order:

1. scripts/01-create-tables.sql
2. scripts/02-enable-rls.sql  
3. scripts/03-seed-data.sql
4. scripts/04-create-functions.sql

After running all scripts, try creating the admin user again.`,
      }
    }

    // Check if admin profile already exists
    const { data: existingProfile } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("email", "admin@company.com")
      .single()

    if (existingProfile) {
      return {
        success: `ADMIN USER READY!

Email: admin@company.com
Password: admin

You can now login with these credentials!`,
      }
    }

    // Check for existing auth user
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers.users?.find((user) => user.email === "admin@company.com")

    let adminUserId: string

    if (existingAuthUser) {
      adminUserId = existingAuthUser.id
      console.log("Found existing auth user, creating profile only")
    } else {
      // Create new auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: "admin@company.com",
        password: "admin",
        email_confirm: true,
        user_metadata: {
          full_name: "System Administrator",
        },
      })

      if (error) {
        console.error("Admin creation error:", error)
        return { error: `Failed to create admin user: ${error.message}` }
      }

      if (!data.user) {
        return { error: "Failed to create admin user - no user data returned" }
      }

      adminUserId = data.user.id
    }

    // Create staff profile
    const { error: profileError } = await supabase.from("staff_profiles").insert({
      id: adminUserId,
      employee_id: "ADMIN001",
      first_name: "System",
      last_name: "Administrator",
      email: "admin@company.com",
      department: "Management",
      position: "Administrator",
      role: "admin",
      hire_date: new Date().toISOString().split("T")[0],
    })

    if (profileError) {
      console.error("Admin profile creation error:", profileError)
      return { error: `Profile setup failed: ${profileError.message}` }
    }

    return {
      success: `ADMIN USER CREATED SUCCESSFULLY!

Email: admin@company.com
Password: admin
Role: Administrator

You can now login with these credentials!`,
    }
  } catch (error) {
    console.error("Admin creation error:", error)
    return {
      error:
        "Failed to create default admin user. Please ensure database tables are set up first by running the setup scripts.",
    }
  }
}
