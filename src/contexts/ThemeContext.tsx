/**
 * Theme Context
 * Provides dark mode & read mode toggling across the app.
 * Modes: 'light' | 'dark' | 'read'
 * - light: default (current orange/green palette)
 * - dark: Lichess-style dark with warm tones
 * - read: high-contrast sepia for outdoor/sunlight readability
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'read';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (mode: ThemeMode) => void;
    cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'ektamandi-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'dark' || saved === 'read') return saved;
        } catch { /* ignore */ }
        return 'light';
    });

    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
        try { localStorage.setItem(THEME_KEY, mode); } catch { /* ignore */ }
    };

    const cycleTheme = () => {
        const order: ThemeMode[] = ['light', 'dark', 'read'];
        const next = order[(order.indexOf(theme) + 1) % order.length];
        setTheme(next);
    };

    // Apply class to <html> so CSS can respond
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark', 'theme-read');
        root.classList.add(`theme-${theme}`);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
