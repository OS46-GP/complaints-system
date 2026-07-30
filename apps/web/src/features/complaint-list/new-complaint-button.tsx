import { Plus, ScanLine, FileText } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NewComplaintButtonProps {
  newComplaintPath: string;
  ocrPath: string;
}

export function NewComplaintButton({ newComplaintPath, ocrPath }: NewComplaintButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1 md:gap-2">
          <Plus className="size-4" />
          <span>جديد</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link to={newComplaintPath} className="gap-2">
            <FileText className="size-4" />
            إدخال عادي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ocrPath} className="gap-2">
            <ScanLine className="size-4" />
            إدخال عبر OCR
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
