'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemUI = matchMedia("prefers-color-scheme: dark").matches ? 'dark' : 'light';

    setTheme(savedTheme || systemUI);
  }, []);

  useEffect(() => {
    if(!theme) return;

    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!theme) return <div className="h-7 w-7" />;

  return (
    <button
      onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle theme"
      className="py-0.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === 'dark' ? <Moon /> : <Sun />}
    </button>
  );
}
