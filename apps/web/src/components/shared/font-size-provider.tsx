/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export const FONT_SIZE_OPTIONS = ["sm", "md", "lg", "xl"] as const;

export type FontSize = (typeof FONT_SIZE_OPTIONS)[number];

export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: "صغير",
  md: "متوسط",
  lg: "كبير",
  xl: "أكبر",
};

type FontSizeProviderProps = {
  children: React.ReactNode;
  defaultFontSize?: FontSize;
  storageKey?: string;
};

type FontSizeProviderState = {
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
};

const initialState: FontSizeProviderState = {
  fontSize: "md",
  setFontSize: () => null,
};

const FontSizeContext = createContext<FontSizeProviderState>(initialState);

export function FontSizeProvider({
  children,
  defaultFontSize = "md",
  storageKey = "app-font-size",
  ...props
}: FontSizeProviderProps) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem(storageKey) as FontSize | null;
    return saved && FONT_SIZE_OPTIONS.includes(saved)
      ? saved
      : defaultFontSize;
  });

  // Apply before paint so the chosen size never flashes the default.
  useLayoutEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  const value = {
    fontSize,
    setFontSize: (size: FontSize) => {
      localStorage.setItem(storageKey, size);
      setFontSizeState(size);
    },
  };

  return (
    <FontSizeContext.Provider {...props} value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => {
  const context = useContext(FontSizeContext);

  if (context === undefined)
    throw new Error("useFontSize must be used within a FontSizeProvider");

  return context;
};
