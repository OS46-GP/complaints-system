interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item}
          className="font-body text-body-md text-foreground break-words flex items-start gap-2"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}