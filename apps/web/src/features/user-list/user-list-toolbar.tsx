import { Filter, SlidersHorizontal, Search } from "lucide-react";

export function UserListToolbar() {
  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          className="w-full h-10 pr-10 pl-4 bg-surface-container-lowest border border-input rounded-lg text-body-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-all"
          placeholder="البحث عن موظف..."
          type="text"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 bg-primary-container text-primary-foreground rounded-full text-label-sm font-medium whitespace-nowrap cursor-pointer"
          >
            <Filter className="size-[18px]" />
            الكل
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 bg-surface-container-lowest border border-border text-muted-foreground rounded-full text-label-sm whitespace-nowrap hover:bg-surface-container-low cursor-pointer"
          >
            العمليات
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 bg-surface-container-lowest border border-border text-muted-foreground rounded-full text-label-sm whitespace-nowrap hover:bg-surface-container-low cursor-pointer"
          >
            الدعم الفني
          </button>
        </div>
        <button
          type="button"
          className="p-2 text-muted-foreground hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </div>
    </div>
  );
}
