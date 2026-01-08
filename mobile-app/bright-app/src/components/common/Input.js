import React from 'react';
import { View, TextInput, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    icon,
    error,
    keyboardType = 'default'
}) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                    {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={Colors.textSecondary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: Typography.caption,
        fontWeight: Typography.medium,
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 56,
        paddingHorizontal: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 1 }
        })
    },
    inputError: {
        borderColor: Colors.error,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.small,
        marginTop: 4,
        marginLeft: 4,
    }
});
