import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function Container({ children, style, edges = ['top', 'left', 'right'] }) {
    const { colors, isDark } = useTheme();
    
    return (
        <View style={[styles.background, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={isDark ? "light-content" : "dark-content"} 
                backgroundColor={colors.background} 
            />
            <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
                {children}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
