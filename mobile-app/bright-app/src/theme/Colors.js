const palette = {
    primary: '#0f85c9',
    primaryDark: '#0B69A3',
    primaryLight: '#E3F2FD',
    accent: '#FFD700',

    // Status
    error: '#E53E3E',
    success: '#38A169',
    warning: '#D69E2E',
    info: '#3182CE',

    white: '#FFFFFF',
    black: '#000000',

    gray100: '#F7FAFC',
    gray200: '#E2E8F0',
    gray400: '#CBD5E0',
    gray500: '#A0AEC0',
    gray600: '#718096',
    gray700: '#4A5568',
    gray800: '#2D3748',
    gray900: '#1A202C',
};

const lightTheme = {
    dark: false,
    colors: {
        primary: palette.primary,
        primaryLight: palette.primaryLight,
        primaryDark: palette.primaryDark,
        
        background: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceVariant: '#F8F9FA',
        
        text: '#1A202C',
        textSecondary: '#4A5568',
        textTertiary: '#718096',
        textInverse: '#FFFFFF',
        
        border: '#E2E8F0',
        borderLight: '#F1F5F9',
        
        inputBackground: '#F8F9FA',
        
        shadow: 'rgba(0,0,0,0.1)',
        
        ...palette
    }
};

const darkTheme = {
    dark: true,
    colors: {
        primary: '#3B82F6', // Более яркий синий для темной темы
        primaryLight: 'rgba(59, 130, 246, 0.1)',
        primaryDark: '#1E40AF',
        
        background: '#0F172A', // Очень темный синий
        surface: '#1E293B', // Темно-серый для карточек
        surfaceVariant: '#334155', // Светлее для выделения
        
        text: '#F1F5F9', // Почти белый для основного текста
        textSecondary: '#CBD5E1', // Светло-серый для вторичного текста
        textTertiary: '#94A3B8', // Серый для третичного текста
        textInverse: '#0F172A', // Темный текст на светлых элементах
        
        border: '#334155',
        borderLight: '#475569',
        
        inputBackground: '#334155',
        
        shadow: 'rgba(0,0,0,0.3)',
        
        // Статусные цвета адаптированы для темной темы
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        
        ...palette
    }
};

export default {
    light: lightTheme,
    dark: darkTheme,
    // Обратная совместимость (по умолчанию светлая)
    ...lightTheme.colors
};