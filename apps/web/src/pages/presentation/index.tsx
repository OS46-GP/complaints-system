import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  MonitorPlay,
  Moon,
  Sun,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PATHS } from "@/router/paths";
import { useTheme } from "@/components/shared/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SLIDES } from "./registry";
import { BackgroundOrbs } from "./primitives";

const ENTER_CLASSES = {
  next: "animate-in duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] fade-in slide-in-from-right-12 fill-mode-both",
  prev: "animate-in duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] fade-in slide-in-from-left-12 fill-mode-both",
} as const;

function getEffectiveTheme(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function useEffectiveTheme() {
  const [effective, setEffective] = useState<"dark" | "light">(getEffectiveTheme);

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setEffective(getEffectiveTheme()),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return effective;
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return { isFullscreen, toggle };
}

export default function PresentationPage() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFullscreen, toggle } = useFullscreen();
  const { theme, setTheme } = useTheme();
  const effectiveTheme = useEffectiveTheme();

  const touchX = useRef<number | null>(null);
  const total = SLIDES.length;
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleDownload = useCallback(async () => {
    setExportOpen(true);
    setExporting(true);
    try {
      const [{ toCanvas }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const running = document.getAnimations().filter((a) => {
        const timing = a.effect?.getComputedTiming();
        return a.playState === "running" && timing?.iterations !== Infinity;
      });
      await Promise.allSettled(running.map((a) => a.finished));
      await new Promise((r) => setTimeout(r, 400));

      const waitForImages = async (root: HTMLElement) => {
        const images = Array.from(root.querySelectorAll("img"));
        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                  return;
                }
                const done = () => resolve();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              }),
          ),
        );
      };

      const PAGE_W = 360;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [PAGE_W, 202.5],
        compress: true,
      });
      for (let i = 0; i < SLIDES.length; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        el.style.height = "auto";
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
        await waitForImages(el);
        const canvas = await toCanvas(el, {
          pixelRatio: 2,
          cacheBust: true,
        });
        el.style.height = "1080px";
        const pageH = (canvas.height / canvas.width) * PAGE_W;
        pdf.addPage([PAGE_W, pageH], "landscape");
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          PAGE_W,
          pageH,
          undefined,
          "FAST",
        );
      }
      pdf.deletePage(1);
      pdf.save("complaints-system-presentation.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportOpen(false);
      setExporting(false);
    }
  }, []);

  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    setIndex((current) => {
      setDirection(clamped > current ? "next" : "prev");
      return clamped;
    });
  }, [total]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
        case "Enter":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(total - 1);
          break;
        case "f":
        case "F":
          toggle();
          break;
        case "m":
        case "M":
          setMenuOpen((o) => !o);
          break;
        case "t":
        case "T":
          setTheme(getEffectiveTheme() === "dark" ? "light" : "dark");
          break;
        case "Escape":
          if (menuOpen) setMenuOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, goTo, total, toggle, menuOpen, setTheme]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) next();
      else prev();
    }
    touchX.current = null;
  };

  const ActiveSlide = SLIDES[index].Component;
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      dir="ltr"
      lang="en"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background text-foreground"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <BackgroundOrbs />

      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 z-30 h-1 bg-border/40">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary-container to-tertiary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 pb-2 pt-5 sm:px-8">
        <Link
          to={PATHS.LOGIN}
          className="group inline-flex items-center gap-2.5"
          title="Exit presentation"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container shadow-sm transition-transform group-hover:scale-105">
            <MonitorPlay className="size-4 text-primary-foreground" />
          </span>
          <span className="hidden font-heading text-sm font-bold tracking-tight text-foreground sm:block">
            Complaints Management System
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
                title="Theme (T)"
              >
                {effectiveTheme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as "light" | "dark" | "system")
                }
              >
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
            title="Overview (M)"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={exporting}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            title="Download presentation as PDF"
          >
            <Download className="size-4" />
          </button>
          <Link
            to={PATHS.LOGIN}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-destructive"
            title="Close presentation"
          >
            <X className="size-4" />
          </Link>
        </div>
      </header>

      {/* Slide stage */}
      <main
        className="relative z-10 flex min-h-0 flex-1"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (e.target !== e.currentTarget) return;
          if (x > rect.width * 0.6) next();
          else if (x < rect.width * 0.4) prev();
        }}
      >
        <div key={index} className={cn("h-full w-full", ENTER_CLASSES[direction])}>
          <ActiveSlide />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 flex items-center justify-between gap-4 px-5 pb-5 pt-2 sm:px-8">
        <div className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              title={s.title}
              className={cn(
                "h-1.5 shrink-0 rounded-full transition-all duration-300",
                i === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>

        <span className="flex-1 font-mono text-xs text-muted-foreground md:flex-none">
          {String(index + 1).padStart(2, "0")}
          <span className="mx-1 text-border">/</span>
          {String(total).padStart(2, "0")}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            title="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/85 disabled:pointer-events-none disabled:opacity-40"
            title="Next slide"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>

      {/* Overview menu */}
      {menuOpen && (
        <div className="absolute inset-0 z-40 flex flex-col bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Presentation Overview
            </h2>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-card/70 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              title="Close (Esc)"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-10 sm:px-10">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    goTo(i);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    i === index
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/50 bg-card/60 hover:border-primary/30 hover:bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                      i === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="font-heading text-sm font-semibold text-foreground">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF export layer */}
      {exportOpen && (
        <div
          data-export-layer
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-background"
          aria-hidden
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="relative shrink-0 bg-background text-foreground"
              style={{ width: 1920, height: 1080 }}
            >
              <BackgroundOrbs />
              <s.Component />
            </div>
          ))}
        </div>
      )}

      {/* Export loading overlay */}
      {exporting && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-md">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="font-heading text-lg font-semibold text-foreground">
            Generating high-quality PDF…
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Rendering {SLIDES.length} slides
          </p>
        </div>
      )}
    </div>
  );
}
