import { useColorScheme } from 'react-native';
import ColorsData from './Colors';

export const useTheme = () => {
    const scheme = useColorScheme(); // 'light' or 'dark'
    const isDark = scheme === 'dark';

    // Возвращаем цвета в зависимости от темы
    const colors = isDark ? ColorsData.dark.colors : ColorsData.light.colors;

    return {
        colors,
        isDark,
        theme: isDark ? 'dark' : 'light'
    };
};
