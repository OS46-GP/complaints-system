import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizePath(p: string) {
  const trimmed = p.endsWith("/") ? p.slice(0, -1) : p;
  return trimmed || "/";
}

/**
 * Determine which nav URLs should be highlighted as active for the given
 * pathname. A url is a match when the pathname equals it (or its child, i.e.
 * starts with `url + "/"`). When several urls match (e.g. `/admin/complaints`
 * and `/admin/complaints/ocr` on the ocr path), only the one with the longest
 * url stays active, so leaf routes don't also highlight their parent.
 */
export function resolveActiveUrls(
  pathname: string,
  urls: string[],
): Set<string> {
  const normalized = normalizePath(pathname);
  let best: string | null = null;
  let bestLength = -1;

  for (const raw of urls) {
    if (raw === "#") continue;
    const url = normalizePath(raw);
    const isMatch =
      normalized === url || normalized.startsWith(url + "/");
    if (isMatch && url.length > bestLength) {
      best = url;
      bestLength = url.length;
    }
  }

  const active = new Set<string>();
  if (best) {
    for (const raw of urls) {
      if (raw === "#") continue;
      if (normalizePath(raw) === best) active.add(raw);
    }
  }
  return active;
}
