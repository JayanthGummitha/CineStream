import { IconBell } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-yellow-500/20">
          <IconBell className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your activity
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>No new notifications</CardTitle>
            <CardDescription>
              You're all caught up! Check back later for updates.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
