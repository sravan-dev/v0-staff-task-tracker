"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Settings } from "lucide-react"
import { createDefaultAdmin } from "@/lib/actions"

export default function SetupPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  const handleCreateAdmin = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const response = await createDefaultAdmin()
      setResult(response)
    } catch (error) {
      setResult({ error: "An unexpected error occurred" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">System Setup</CardTitle>
          <CardDescription>Create the default administrator account to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Default Admin Credentials</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Email:</strong> admin@company.com
              </p>
              <p>
                <strong>Password:</strong> admin
              </p>
            </div>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.success || result.error}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleCreateAdmin} disabled={isCreating || result?.success} className="w-full">
            {isCreating ? "Creating Admin User..." : result?.success ? "Admin Created!" : "Create Default Admin"}
          </Button>

          {result?.success && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <a href="/auth/login">Go to Login</a>
              </Button>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Please change the default password after your first login for security
              purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
