import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Container from '../../components/common/Container';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Ошибка', 'Заполните все поля');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            let errorMessage = 'Неизвестная ошибка';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMessage = 'Неправильный email или пароль';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Пользователь не найден';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Слишком много попыток. Попробуйте позже';
            }
            showAlert('Ошибка входа', errorMessage);
        }
    };

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>С возвращением!</Text>
                <Text style={styles.subtitle}>Введите данные для входа</Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Email"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    icon="mail-outline"
                    keyboardType="email-address"
                />
                <Input
                    label="Пароль"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock-closed-outline"
                    secureTextEntry
                />

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotText}>Забыли пароль?</Text>
                </TouchableOpacity>

                <Button
                    title="Войти"
                    onPress={handleLogin}
                    loading={loading}
                    style={{ marginTop: 20 }}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Нет аккаунта? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Создать</Text>
                </TouchableOpacity>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.body,
        color: Colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        color: Colors.primary,
        fontSize: Typography.small,
        fontWeight: Typography.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: Typography.body,
    },
    link: {
        color: Colors.primary,
        fontWeight: Typography.bold,
        fontSize: Typography.body,
    }
});
