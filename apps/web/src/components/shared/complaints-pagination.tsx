import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface ComplaintsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showGoto?: boolean;
}

export function ComplaintsPagination({
  currentPage,
  totalPages,
  onPageChange,
  showGoto = true,
}: ComplaintsPaginationProps) {
  const [gotoDraft, setGotoDraft] = useState<string | null>(null);
  const gotoValue = gotoDraft ?? String(currentPage);

  const submitGoto = () => {
    const val = parseInt(gotoValue, 10);
    if (val >= 1 && val <= totalPages) onPageChange(val);
    setGotoDraft(null);
  };

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="default"
              aria-label="Go to previous page"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="ps-2!"
            >
              <ChevronLeftIcon className="rtl:rotate-180" />
            </Button>
          </PaginationItem>

          {pages.map((page, i) =>
            page === "ellipsis" ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <Button
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <Button
              variant="ghost"
              size="default"
              aria-label="Go to next page"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="pe-2!"
            >
              <ChevronRightIcon className="rtl:rotate-180" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {showGoto && (
        <div className="flex items-center gap-2">
          <span className="font-heading text-label-sm text-muted-foreground">
            الانتقال إلى صفحة:
          </span>
          <form onSubmit={(e) => { e.preventDefault(); submitGoto(); }}>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={gotoValue}
              onChange={(e) => setGotoDraft(e.target.value)}
              onBlur={submitGoto}
              className="h-10 w-16 text-center font-mono text-mono-data [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </form>
        </div>
      )}
    </div>
  );
}
