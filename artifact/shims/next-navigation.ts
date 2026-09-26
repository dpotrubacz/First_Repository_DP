import { useSyncExternalStore } from "react";
import { currentPath } from "./routes";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, currentPath, () => "/");
}
