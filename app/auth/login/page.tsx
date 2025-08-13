import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, AlertCircle } from "lucide-react"
import { createDefaultAdmin } from "@/lib/actions"

export default async function LoginPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  const { data: staffProfiles } = await supabase.from("staff_profiles").select("id").eq("role", "admin").limit(1)

  const hasAdmin = staffProfiles && staffProfiles.length > 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {!hasAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg text-orange-900">First Time Setup</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                No admin user found. Create the default admin account to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createDefaultAdmin}>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Default Admin User
                </Button>
              </form>
              <p className="text-xs text-orange-600 mt-2 text-center">
                This will create admin@company.com with password "admin"
              </p>
            </CardContent>
          </Card>
        )}

        <LoginForm />
      </div>
    </div>
  )
}
