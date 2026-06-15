const KEY = "theme";

export function getInitialDark(): boolean {
  const stored = localStorage.getItem(KEY);
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function setDarkMode(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(KEY, dark ? "dark" : "light");
}

// Apply the persisted/preferred theme at app startup so every route — including
// the public pages that don't render Layout (/guide, /login, /register) — gets
// the right colours instead of defaulting to light.
export function applyStoredTheme(): void {
  setDarkMode(getInitialDark());
}
