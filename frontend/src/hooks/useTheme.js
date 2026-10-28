export function useTheme() {
  if (typeof document !== 'undefined') document.documentElement.classList.remove('dark');
  return { theme: 'light', toggleTheme: () => {}, isDark: false };
}
