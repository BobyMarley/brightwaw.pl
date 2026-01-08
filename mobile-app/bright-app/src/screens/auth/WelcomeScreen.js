import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Button from '../../components/common/Button';

export default function WelcomeScreen({ navigation }) {
    return (
        <LinearGradient
            colors={[Colors.primaryLight, '#FFFFFF']}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {/* Logo Placeholder - In production, replace with Image component */}
                    <Text style={{ fontSize: 60 }}>💎</Text>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>BrightHouse</Text>
                    <Text style={styles.subtitle}>Premium Cleaning Service</Text>
                    <Text style={styles.description}>
                        Professional cleaning for your home and office in Warsaw. Book in seconds.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Войти"
                        onPress={() => navigation.navigate('Login')}
                    />
                    <Button
                        title="Регистрация"
                        variant="outline"
                        onPress={() => navigation.navigate('Register')}
                    />
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
        paddingTop: 100,
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: Typography.extraBold,
        color: Colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.h3,
        fontWeight: Typography.medium,
        color: Colors.text,
        marginBottom: 16,
    },
    description: {
        fontSize: Typography.body,
        textAlign: 'center',
        color: Colors.textSecondary,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    buttonContainer: {
        gap: 12, // React Native 0.71+ supports gap
        width: '100%',
    }
});
