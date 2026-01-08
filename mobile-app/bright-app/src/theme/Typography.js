import { Platform } from 'react-native';

export default {
    // Font Families
    primary: Platform.select({ ios: 'System', android: 'Roboto' }), // We can add custom fonts later if needed

    // Font Sizes
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
    small: 12,

    // Weights
    regular: '400',
    medium: '500',
    bold: '700',
    extraBold: '800',
};
