import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            console.error("Login failed:", err);
            let msg = 'Неверный email или пароль';
            if (err.code === 'auth/invalid-email') msg = 'Некорректный формат Email';
            if (err.code === 'auth/user-not-found') msg = 'Пользователь не найден';
            if (err.code === 'auth/invalid-credential') msg = 'Неверные данные для входа (Email или Пароль)';
            if (err.code === 'auth/too-many-requests') msg = 'Слишком много попыток. Попробуйте позже.';
            setError(msg + ` (${err.code})`);
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f5f5'
        }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                    BrightHouse Admin
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Пароль"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                    >
                        Войти
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
