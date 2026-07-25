export function AuthFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-border bg-surface-container-lowest px-container-padding py-stack-md md:flex-row">
      <div className="text-center md:text-right">
        <h2 className="font-heading text-headline-md text-primary">
          نظام إدارة الشكاوى
        </h2>
        <p className="mt-1 font-body text-label-sm text-muted-foreground">
          © ٢٠٢٤ نظام إدارة الشكاوى المؤسسي. جميع الحقوق محفوظة.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-gutter">
        <a
          href="#"
          className="font-body text-label-sm text-muted-foreground transition-colors hover:text-primary"
        >
          سياسة الخصوصية
        </a>
        <a
          href="#"
          className="font-body text-label-sm text-muted-foreground transition-colors hover:text-primary"
        >
          شروط الخدمة
        </a>
        <a
          href="#"
          className="font-body text-label-sm text-muted-foreground transition-colors hover:text-primary"
        >
          الدعم الفني
        </a>
      </div>
    </footer>
  );
}
