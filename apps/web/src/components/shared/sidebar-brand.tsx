import { type LucideIcon } from "lucide-react"

export function SidebarBrand({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container">
        <Icon className="size-5 text-white" />
      </div>
      <div className="grid group-data-[collapsible=icon]:hidden">
        <span className="font-heading text-xl font-bold leading-tight text-primary-fixed">
          {title}
        </span>
        <span className="text-xs font-medium text-sidebar-foreground/70">
          {subtitle}
        </span>
      </div>
    </div>
  )
}
