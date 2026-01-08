import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: darkMode ? '#3B82F6' : '#0f85c9',
                light: darkMode ? '#60a5fa' : '#E3F2FD',
                dark: darkMode ? '#1E40AF' : '#0B69A3',
            },
            secondary: {
                main: darkMode ? '#a78bfa' : '#8b5cf6',
            },
            success: {
                main: darkMode ? '#10B981' : '#38A169',
            },
            error: {
                main: darkMode ? '#EF4444' : '#E53E3E',
            },
            warning: {
                main: darkMode ? '#F59E0B' : '#D69E2E',
            },
            info: {
                main: darkMode ? '#3B82F6' : '#3182CE',
            },
            background: {
                default: darkMode ? '#0F172A' : '#f8fafc',
                paper: darkMode ? '#1E293B' : '#ffffff',
            },
            text: {
                primary: darkMode ? '#F1F5F9' : '#1A202C',
                secondary: darkMode ? '#CBD5E1' : '#4A5568',
            },
            divider: darkMode ? '#334155' : '#E2E8F0',
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: darkMode ? '#0F172A' : '#f8fafc',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                        boxShadow: darkMode 
                            ? '0 4px 6px -1px rgba(0,0,0,0.3)' 
                            : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                        backgroundImage: 'none',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: darkMode 
                                ? '0 4px 6px -1px rgba(0,0,0,0.3)' 
                                : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                        borderRight: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                        boxShadow: darkMode 
                            ? '0 1px 3px 0 rgba(0,0,0,0.3)' 
                            : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                    },
                    outlined: {
                        borderColor: darkMode ? '#475569' : '#cbd5e1',
                        color: darkMode ? '#CBD5E1' : '#4A5568',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: darkMode ? '#334155' : '#F8F9FA',
                            color: darkMode ? '#F1F5F9' : '#1A202C',
                            '& fieldset': {
                                borderColor: darkMode ? '#475569' : '#E2E8F0',
                            },
                            '&:hover fieldset': {
                                borderColor: darkMode ? '#64748b' : '#94a3b8',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: darkMode ? '#CBD5E1' : '#4A5568',
                        },
                        '& .MuiInputBase-input': {
                            color: darkMode ? '#F1F5F9' : '#1A202C',
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#334155' : '#F8F9FA',
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: darkMode ? '#CBD5E1' : '#4A5568',
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                    head: {
                        backgroundColor: darkMode ? '#0F172A' : '#f8fafc',
                        fontWeight: 700,
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#0F172A' : '#f8fafc',
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                        color: darkMode ? '#F1F5F9' : '#1A202C',
                    },
                },
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#0F172A' : '#f8fafc',
                    },
                },
            },
            MuiTypography: {
                styleOverrides: {
                    root: {
                        color: darkMode ? '#F1F5F9' : undefined,
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};