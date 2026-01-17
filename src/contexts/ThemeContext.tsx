import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, Theme, CssBaseline } from '@mui/material';
import { aeonTheme, ecoTheme, darkTheme } from '../theme/themes';

type ThemeName = 'dark' | 'aeon' | 'eco';

interface ThemeContextType {
    currentTheme: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeName, setThemeName] = useState<ThemeName>('dark'); // Default to dark

    useEffect(() => {
        // Load saved theme from local storage
        const savedTheme = localStorage.getItem('app-theme') as ThemeName;
        if (savedTheme && ['dark', 'aeon', 'eco'].includes(savedTheme)) {
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
            default: return darkTheme;
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
