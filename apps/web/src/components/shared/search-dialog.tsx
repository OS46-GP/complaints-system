import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

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
import { PATHS } from "@/router/paths";

export function SearchDialog() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;
    const base = isAdmin ? PATHS.ADMIN.COMPLAINTS : PATHS.USER.COMPLAINTS;
    navigate(`${base}?search=${encodeURIComponent(query)}`);
    setOpen(false);
    setValue("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="relative px-4 py-3">
          <Search className="absolute start-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="اكتب كلمة البحث..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 rounded-lg border-none bg-muted ps-9 pe-4 text-base"
            autoFocus
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
