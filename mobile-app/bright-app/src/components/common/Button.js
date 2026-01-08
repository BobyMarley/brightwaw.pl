import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/Colors';

/**
 * A simpler, robust Button component.
 * Layout is controlled by the parent via the 'style' prop.
 * Visuals are standardized here.
 */
export default function Button({
    onPress,
    title,
    variant = 'primary', // 'primary', 'outline', 'ghost'
    loading = false,
    style,
    textStyle
}) {
    // Base container styles
    const containerStyles = [
        styles.baseContainer,
        variant === 'outline' && styles.outlineContainer,
        variant === 'ghost' && styles.ghostContainer,
        style // Allow parent to override (e.g. { flex: 1 })
    ];

    // Text styles
    const labelStyles = [
        styles.baseText,
        variant === 'outline' && styles.outlineText,
        variant === 'ghost' && styles.ghostText,
        textStyle
    ];

    // Primary Button (Gradient)
    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={loading}
                activeOpacity={0.8}
                style={[styles.baseContainer, styles.primaryContainer, style]}
            >
                <LinearGradient
                    colors={[Colors.primary, '#2563EB']} // Standard Blue Gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.baseText, { color: '#fff' }, textStyle]}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Secondary / Outline / Ghost Buttons
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
            style={containerStyles}
        >
            {loading ? (
                <ActivityIndicator color={Colors.primary} />
            ) : (
                <Text style={labelStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    baseContainer: {
        height: 48, // Standard mobile button height
        borderRadius: 12, // Modern, slightly rounded
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        ...Platform.select({
            web: { cursor: 'pointer', userSelect: 'none' }
        })
    },
    primaryContainer: {
        padding: 0,
        overflow: 'hidden',
        borderWidth: 0,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary, // Primary color border for better visibility
    },
    ghostContainer: {
        backgroundColor: 'transparent',
    },
    baseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff', // Default for primary
    },
    outlineText: {
        color: Colors.primary, // Primary color for better contrast
    },
    ghostText: {
        color: Colors.primary,
    }
});
