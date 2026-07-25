import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotificationBell({ count }: { count?: number }) {
  return (
    <Button variant="ghost" size="icon" className="relative rounded-full">
      <Bell className="size-5 text-muted-foreground" />
      {count !== undefined && (
        <span className="absolute end-1.5 top-1.5 flex size-2 items-center justify-center rounded-full bg-destructive" />
      )}
    </Button>
  )
}
