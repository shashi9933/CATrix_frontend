import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, Theme, CssBaseline } from '@mui/material';
import { aeonTheme, ecoTheme, whiteTheme, newDarkTheme, neonTheme } from '../theme/themes';

type ThemeName = 'white' | 'aeon' | 'eco' | 'newDark' | 'neon';

interface ThemeContextType {
    currentTheme: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeName, setThemeName] = useState<ThemeName>('aeon'); // Default to Aeon Glass theme

    useEffect(() => {
        // Load saved theme from local storage
        const savedTheme = localStorage.getItem('app-theme') as ThemeName;
        if (savedTheme && ['white', 'aeon', 'eco', 'newDark', 'neon'].includes(savedTheme)) {
            setThemeName(savedTheme);
        }
    }, []);

    const changeTheme = (name: ThemeName) => {
        setThemeName(name);
        localStorage.setItem('app-theme', name);
    };

    const getActiveTheme = (): Theme => {
        switch (themeName) {
            case 'aeon': return aeonTheme;
            case 'eco': return ecoTheme;
            case 'neon': return neonTheme;
            case 'newDark': return newDarkTheme;
            case 'white': return whiteTheme;
            default: return aeonTheme; // Default to Aeon Glass
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme: themeName, setTheme: changeTheme }}>
            <ThemeProvider theme={getActiveTheme()}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useThemeContext must be used within CustomThemeProvider");
    return context;
};
