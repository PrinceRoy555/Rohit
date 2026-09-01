import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSiteConfig } from './SiteConfigContext';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'website-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return getSystemTheme();
}

function applyThemeToDom(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Synchronize data-theme and .dark class simultaneously
  root.setAttribute('data-theme', resolved);
  root.dataset.theme = resolved;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update browser mobile toolbar theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolved === 'dark' ? '#080607' : '#F8F5F2');
  }
}

function announceThemeChange(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const message = resolved === 'dark' ? 'Dark tone activated.' : 'Light tone activated.';
  let sr = document.getElementById('sr-announcement');
  if (!sr) {
    sr = document.createElement('div');
    sr.id = 'sr-announcement';
    sr.className = 'sr-only';
    sr.setAttribute('aria-live', 'assertive');
    sr.setAttribute('aria-atomic', 'true');
    document.body.appendChild(sr);
  }
  sr.textContent = message;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { activeConfig } = useSiteConfig();
  const cmsDefaultMode = activeConfig?.theme?.mode || 'system';

  // Read initial preference from localStorage or fallback to CMS default
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          return saved;
        }
      } catch {
        // storage disabled or unavailable
      }
    }
    return cmsDefaultMode;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(preference));

  // Update resolved theme when preference changes
  useEffect(() => {
    const nextResolved = resolveTheme(preference);
    setResolvedTheme(nextResolved);
    applyThemeToDom(nextResolved);
  }, [preference]);

  // Listen for System preference changes when mode is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (preference === 'system') {
        const nextResolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        applyThemeToDom(nextResolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, [preference]);

  // Synchronize theme across browser tabs via storage event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newPref = e.newValue as ThemePreference | null;
        if (newPref === 'dark' || newPref === 'light' || newPref === 'system') {
          setPreferenceState(newPref);
          const nextResolved = resolveTheme(newPref);
          setResolvedTheme(nextResolved);
          applyThemeToDom(nextResolved);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = useCallback((newPref: ThemePreference) => {
    setPreferenceState(newPref);
    try {
      localStorage.setItem(STORAGE_KEY, newPref);
    } catch {
      // safe fallback
    }
    const nextResolved = resolveTheme(newPref);
    setResolvedTheme(nextResolved);
    applyThemeToDom(nextResolved);
    announceThemeChange(nextResolved);
  }, []);

  const toggleTheme = useCallback(() => {
    // Determine next state from the currently resolved theme
    const nextPref: ThemePreference = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextPref);
  }, [resolvedTheme, setTheme]);

  const value: ThemeContextValue = {
    preference,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
