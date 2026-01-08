import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import ColorsData from '../theme/Colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 'system', 'light', 'dark'
    const systemScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system');

    // Вычисляем текущую тему
    const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

    // Получаем цвета
    const colors = isDark ? ColorsData.dark.colors : ColorsData.light.colors;

    const toggleTheme = () => {
        setThemeMode(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system'; // cycle through system
            return 'light';
        });
    };

    // Простой сеттер для явного выбора
    const setTheme = (mode) => setThemeMode(mode);

    return (
        <ThemeContext.Provider value={{ theme: themeMode, isDark, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
