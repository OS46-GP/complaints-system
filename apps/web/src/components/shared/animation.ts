export const ANIMATION_VARIANTS = {
  fade: "fade-in",
  "slide-up": "fade-in slide-in-from-bottom-3",
  "slide-down": "fade-in slide-in-from-top-3",
  zoom: "fade-in zoom-in-95",
  page: "fade-in zoom-in-95 slide-in-from-bottom-5",
} as const;

export type AnimationVariant = keyof typeof ANIMATION_VARIANTS;

export const DEFAULT_ANIMATION_DURATION = "duration-500";
export const DEFAULT_ANIMATION_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
