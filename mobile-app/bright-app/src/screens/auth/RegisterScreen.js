import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import Container from '../../components/common/Container';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, loading } = useAuth();

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            showAlert('Ошибка', 'Заполните все поля');
            return;
        }

        try {
            await register(name, email, password);
            showAlert('Успех!', 'Проверьте ваш email для подтверждения аккаунта');
        } catch (error) {
            let message = 'Произошла ошибка при регистрации';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Этот Email уже используется. Попробуйте войти.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Некорректный Email';
            } else if (error.code === 'auth/weak-password') {
                message = 'Пароль должен быть не менее 6 символов';
            }
            showAlert('Ошибка регистрации', message);
        }
    };

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Создать аккаунт</Text>
                <Text style={styles.subtitle}>Начните пользоваться премиум уборкой</Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Имя"
                    placeholder="Иван Иванов"
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                />
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

                <Button
                    title="Зарегистрироваться"
                    onPress={handleRegister}
                    loading={loading}
                    style={{ marginTop: 20 }}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Уже есть аккаунт? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Войти</Text>
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
