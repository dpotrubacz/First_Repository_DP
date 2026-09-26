// Only a bare "#token" survives in an artifact link, so routes map to hash tokens.
export function hashFor(path: string): string {
  return path === "/" ? "#dashboard" : `#${path.replace(/^\//, "")}`;
}

export function currentPath(): string {
  const token = window.location.hash.replace(/^#/, "");
  return token === "expenses" ? "/expenses" : "/";
}
