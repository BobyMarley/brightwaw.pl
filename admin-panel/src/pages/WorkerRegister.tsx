import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function WorkerRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        position: 'Клинер'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Создаем аккаунт
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const uid = userCredential.user.uid;

            // Создаем документ workers с UID
            await setDoc(doc(db, 'workers', uid), {
                uid,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                position: formData.position,
                startDate: new Date().toISOString().split('T')[0],
                photo: '',
                telegram: '',
                whatsapp: '',
                availability: {},
                createdAt: serverTimestamp()
            });

            alert('Регистрация успешна! Теперь вы можете войти.');
            navigate('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                        Регистрация работника
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Имя и фамилия"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Телефон"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Пароль"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                    </form>

                    <Button
                        fullWidth
                        onClick={() => navigate('/')}
                        sx={{ mt: 2 }}
                    >
                        Уже есть аккаунт? Войти
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
}
