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

// Increased shadow constants
const CARD_SHADOW = '0px 10px 30px rgba(0, 0, 0, 0.2)';
const ELEVATED_SHADOW = '0px 15px 40px rgba(0, 0, 0, 0.3)';
const HOVER_SHADOW = '0px 20px 50px rgba(0, 0, 0, 0.4)';

// --- OPTION 1: CLASSIC WHITE (Original - Enhanced) ---
export const whiteTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'light',
        primary: { main: '#6C63FF', light: '#8A84FF', dark: '#4A45B3', contrastText: '#FFFFFF' },
        secondary: { main: '#FF6B6B', light: '#FF8A8A', dark: '#B34A4A', contrastText: '#FFFFFF' },
        background: { default: '#F8F9FA', paper: '#FFFFFF' },
        text: { primary: '#2D3436', secondary: '#636E72' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, padding: '8px 24px', boxShadow: ELEVATED_SHADOW },
            },
        },
        MuiCard: { 
            styleOverrides: { 
                root: { 
                    borderRadius: 12, 
                    boxShadow: CARD_SHADOW,
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: HOVER_SHADOW }
                } 
            } 
        },
        MuiAppBar: { 
            styleOverrides: { 
                root: { 
                    boxShadow: ELEVATED_SHADOW
                } 
            } 
        },
        MuiPaper: {
            styleOverrides: {
                root: { boxShadow: CARD_SHADOW }
            }
        }
    },
});

// --- OPTION 2: AEON GLASS (Light/Pastel - Enhanced) ---
export const aeonTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'light',
        primary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrastText: '#FFFFFF' },
        secondary: { main: '#EC4899', light: '#F472B6', dark: '#DB2777', contrastText: '#FFFFFF' },
        background: {
            default: '#F0F9FF',
            paper: 'rgba(255, 255, 255, 0.8)',
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
                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: '0 20px 60px 0 rgba(31, 38, 135, 0.25)' }
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)'
                }
            }
        }
    },
});

// --- OPTION 3: ECO STUDY (Forest Dark - Enhanced) ---
export const ecoTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'dark',
        primary: { main: '#4ADE80', light: '#86EFAC', dark: '#22C55E', contrastText: '#003300' },
        secondary: { main: '#FBBF24', light: '#FDE68A', dark: '#F59E0B', contrastText: '#000000' },
        background: {
            default: '#1a2f23',
            paper: '#243E30',
        },
        text: { primary: '#F0FDF4', secondary: '#BBF7D0' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#243E30',
                    border: '1px solid #2F5340',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: '0 15px 45px rgba(0, 0, 0, 0.5)' }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    boxShadow: '0 8px 24px rgba(74, 222, 128, 0.2)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
            }
        }
    },
});

// --- OPTION 4: DARK MODE (NEW) ---
export const newDarkTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'dark',
        primary: { main: '#3B82F6', light: '#60A5FA', dark: '#1E40AF', contrastText: '#FFFFFF' },
        secondary: { main: '#8B5CF6', light: '#A78BFA', dark: '#6D28D9', contrastText: '#FFFFFF' },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: { primary: '#f8fafc', secondary: '#cbd5e1' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(15, 23, 42, 0.5)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { 
                    boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                    '&:hover': { boxShadow: '0 20px 50px rgba(59, 130, 246, 0.5)' }
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: { 
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: { boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)' }
            }
        }
    },
});

// --- OPTION 5: NEON MODE (NEW) ---
export const neonTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'dark',
        primary: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2', contrastText: '#000000' },
        secondary: { main: '#A855F7', light: '#D8B4FE', dark: '#7C3AED', contrastText: '#FFFFFF' },
        background: {
            default: '#000000',
            paper: '#111827',
        },
        text: { primary: '#f0fdfa', secondary: '#cffafe' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(17, 24, 39, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.2), 0 25px 60px rgba(0, 0, 0, 0.7)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                        boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 30px 70px rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(6, 182, 212, 0.5)',
                        transform: 'translateY(-2px)'
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { 
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 15px 40px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    '&:hover': { 
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.8), 0 20px 50px rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(6, 182, 212, 0.8)'
                    }
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: { 
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.2), 0 20px 50px rgba(0, 0, 0, 0.7)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(6, 182, 212, 0.1)'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { boxShadow: '0 0 30px rgba(6, 182, 212, 0.2), 0 25px 60px rgba(0, 0, 0, 0.7)' }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: { 
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.3), 0 30px 80px rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { 
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                }
            }
        }
    },
});
