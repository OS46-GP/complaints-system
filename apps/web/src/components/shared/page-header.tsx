interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-heading text-display-lg text-foreground mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground font-body text-body-md">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
