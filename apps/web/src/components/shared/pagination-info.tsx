interface PaginationInfoProps {
  start: number;
  end: number;
  totalCount: number;
  entity?: string;
}

export function PaginationInfo({
  start,
  end,
  totalCount,
  entity = "",
}: PaginationInfoProps) {
  return (
    <p className="font-heading text-body-md sm:text-body-lg text-muted-foreground">
      عرض {start.toLocaleString("ar-SA")} إلى{" "}
      {end.toLocaleString("ar-SA")} من أصل{" "}
      {totalCount.toLocaleString("ar-SA")} {entity}
    </p>
  );
}
