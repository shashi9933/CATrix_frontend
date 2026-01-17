import { createTheme, ThemeOptions } from '@mui/material';

// Common typography and shape settings
const commonSettings: ThemeOptions = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem' },
        h2: { fontWeight: 600, fontSize: '2rem' },
        h3: { fontWeight: 600, fontSize: '1.75rem' },
        h4: { fontWeight: 600, fontSize: '1.5rem' },
        h5: { fontWeight: 600, fontSize: '1.25rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
};

// --- OPTION 1: CLASSIC DARK (Original) ---
export const darkTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'light', // Technically the original was light mode with dark styling overrides, but let's make it a true hybrid or stick to current
        // STICKING TO CURRENT APP.TSX COLORS to ensure no breakage
        primary: { main: '#6C63FF', light: '#8A84FF', dark: '#4A45B3', contrastText: '#FFFFFF' },
        secondary: { main: '#FF6B6B', light: '#FF8A8A', dark: '#B34A4A', contrastText: '#FFFFFF' },
        background: { default: '#F8F9FA', paper: '#FFFFFF' },
        text: { primary: '#2D3436', secondary: '#636E72' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, padding: '8px 24px', boxShadow: 'none' },
            },
        },
        MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' } } },
        MuiAppBar: { styleOverrides: { root: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' } } },
    },
});

// --- OPTION 2: AEON GLASS (Light/Pastel) ---
export const aeonTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'light',
        primary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrastText: '#FFFFFF' }, // Violet
        secondary: { main: '#EC4899', light: '#F472B6', dark: '#DB2777', contrastText: '#FFFFFF' }, // Pink
        background: {
            default: '#F0F9FF', // Light blueish
            paper: 'rgba(255, 255, 255, 0.8)', // Semi-transparent for glass effect
        },
        text: { primary: '#1F2937', secondary: '#4B5563' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default paper gradient in dark mode if switched
                }
            }
        }
    },
});

// --- OPTION 3: ECO STUDY (Forest Dark) ---
export const ecoTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'dark',
        primary: { main: '#4ADE80', light: '#86EFAC', dark: '#22C55E', contrastText: '#003300' }, // Green
        secondary: { main: '#FBBF24', light: '#FDE68A', dark: '#F59E0B', contrastText: '#000000' }, // Amber
        background: {
            default: '#1a2f23', // Deep Forest Green
            paper: '#243E30',   // Lighter Leaf Green
        },
        text: { primary: '#F0FDF4', secondary: '#BBF7D0' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#243E30',
                    border: '1px solid #2F5340',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // Organic roundness
                }
            }
        }
    },
});
