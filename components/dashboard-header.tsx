import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, Bell, LayoutDashboard } from "lucide-react"
import { signOut } from "@/lib/actions"
import Link from "next/link"

interface DashboardHeaderProps {
  profile: {
    first_name: string
    last_name: string
    employee_id: string
    department: string
    position: string
    role: string
  }
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`

  return (
    <header className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Staff CRM</h1>
            <div className="hidden md:block text-sm text-muted-foreground">Welcome back, {profile.first_name}!</div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  My Dashboard
                </Link>
              </Button>
              {(profile.role === "manager" || profile.role === "admin") && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>

            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm">
                <div className="font-medium">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="text-muted-foreground">{profile.position}</div>
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>

            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
