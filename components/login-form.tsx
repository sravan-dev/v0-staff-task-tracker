"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, Info, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, startTransition } from "react"
import { signIn, createDefaultAdmin } from "@/lib/actions"
import { useSearchParams } from "next/navigation"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction] = useActionState(signIn, null)
  const [adminState, adminAction] = useActionState(createDefaultAdmin, null)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)

  const urlMessage = searchParams.get("message")
  const urlError = searchParams.get("error")
  const urlSuccess = searchParams.get("success")

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  const handleCreateAdmin = () => {
    setIsCreatingAdmin(true)
    startTransition(() => {
      adminAction()
    })
  }

  useEffect(() => {
    if (adminState) {
      setIsCreatingAdmin(false)
    }
  }, [adminState])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">Sign in to your staff account</CardDescription>
      </CardHeader>
      <CardContent>
        {urlSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
            {urlSuccess}
          </div>
        )}

        {urlError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {urlError}
          </div>
        )}

        {urlMessage && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
            {urlMessage}
          </div>
        )}

        {adminState?.success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
            {adminState.success}
          </div>
        )}

        {adminState?.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {adminState.error}
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Default Admin Access</p>
              <p className="text-blue-700 mt-1">
                Email: <span className="font-mono">admin@company.com</span>
                <br />
                Password: <span className="font-mono">admin</span>
              </p>
              <p className="text-blue-600 text-xs mt-1">Change these credentials after first login for security.</p>

              <div className="mt-3">
                <Button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-3 w-3" />
                      Create Default Admin User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" name="password" type="password" required />
          </div>

          <SubmitButton />

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
