import { Search, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="md:hidden flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Search className="size-5" />
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle className="text-base font-normal text-muted-foreground">
            البحث في الشكاوى...
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="relative px-4 py-3">
          <Search className="absolute start-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="اكتب كلمة البحث..."
            className="h-12 rounded-lg border-none bg-muted ps-9 pe-4 text-base"
            autoFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
