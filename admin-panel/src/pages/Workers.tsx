import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, Avatar, Chip, IconButton, Stack, Divider, Badge, InputAdornment
} from '@mui/material';
import { 
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Phone as PhoneIcon,
    Email as EmailIcon, Work as WorkIcon, Schedule as ScheduleIcon, Download as DownloadIcon,
    Telegram as TelegramIcon, WhatsApp as WhatsAppIcon, Person as PersonIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, 
    CalendarToday as CalendarIcon, Photo as PhotoIcon, Lock as LockIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import * as XLSX from 'xlsx';
import WorkerSchedule from '../components/WorkerSchedule';

interface Worker {
    id: string;
    name: string;
    phone: string;
    email: string;
    position: string;
    startDate: string;
    photo?: string;
    telegram?: string;
    whatsapp?: string;
    password?: string; // Для формы, не сохраняется в базе
    availability: { [date: string]: string[] }; // date -> array of time slots
}

export default function Workers() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [isAddingWorker, setIsAddingWorker] = useState(false);
    const [workerForm, setWorkerForm] = useState<Partial<Worker>>({});
    const [selectedWorkerSchedule, setSelectedWorkerSchedule] = useState<Worker | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        
        const setupListener = () => {
            try {
                const q = query(collection(db, "workers"), orderBy("name", "asc"));
                unsubscribe = onSnapshot(q, 
                    (snapshot) => {
                        const workersData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Worker[];
                        setWorkers(workersData);
                    },
                    (error) => {
                        console.error('Firestore listener error:', error);
                        // При ошибке подписки, переходим на polling
                        setTimeout(setupPolling, 1000);
                    }
                );
            } catch (error) {
                console.error('Error setting up listener:', error);
                setupPolling();
            }
        };
        
        const setupPolling = async () => {
            try {
                const { getDocs } = await import('firebase/firestore');
                const q = query(collection(db, "workers"), orderBy("name", "asc"));
                const snapshot = await getDocs(q);
                const workersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Worker[];
                setWorkers(workersData);
            } catch (error) {
                console.error('Error loading workers:', error);
            }
        };
        
        // Пробуем сначала реактивную подписку
        setupListener();
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleSaveWorker = async () => {
        if (!workerForm.name?.trim() || !workerForm.phone?.trim()) {
            alert('Укажите имя и телефон работника');
            return;
        }

        try {
            console.log('Saving worker with form data:', workerForm);
            const workerData = {
                name: workerForm.name.trim(),
                phone: workerForm.phone.trim(),
                email: workerForm.email?.trim() || '',
                position: workerForm.position?.trim() || 'Клинер',
                startDate: workerForm.startDate || new Date().toISOString().split('T')[0],
                photo: workerForm.photo?.trim() || '',
                telegram: workerForm.telegram?.trim() || '',
                whatsapp: workerForm.whatsapp?.trim() || '',
                availability: workerForm.availability || {},
                updatedAt: serverTimestamp()
            };

            if (editingWorker) {
                console.log('Updating existing worker:', editingWorker.id);
                await updateDoc(doc(db, "workers", editingWorker.id), workerData);
                alert('Работник обновлен!');
            } else {
                console.log('Creating new worker...');
                const docRef = await addDoc(collection(db, "workers"), {
                    ...workerData,
                    createdAt: serverTimestamp()
                });
                console.log('Worker created with ID:', docRef.id);
                alert('Работник создан! Используйте кнопку "Создать аккаунт" для создания доступа.');
            }

            setEditingWorker(null);
            setIsAddingWorker(false);
            // Очищаем форму полностью
            setWorkerForm({
                name: '',
                phone: '',
                email: '',
                position: '',
                startDate: '',
                photo: '',
                telegram: '',
                whatsapp: '',
                password: '',
                availability: {}
            });
        } catch (error: any) {
            console.error('Error saving worker:', error);
            alert('Ошибка сохранения: ' + error.message);
        }
    };

    const handleDeleteWorker = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить работника?')) {
            try {
                await deleteDoc(doc(db, "workers", id));
                // Список обновится автоматически через onSnapshot
            } catch (error: any) {
                console.error('Delete error:', error);
                alert('Ошибка удаления: ' + error.message);
            }
        }
    };

    const exportSchedule = () => {
        const scheduleData: any[] = [];
        workers.forEach(worker => {
            Object.entries(worker.availability || {}).forEach(([date, times]) => {
                times.forEach(time => {
                    scheduleData.push({
                        Worker: worker.name,
                        Phone: worker.phone,
                        Date: date,
                        Time: time,
                        Position: worker.position
                    });
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(scheduleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, `workers_schedule_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getWorkerExperience = (startDate: string) => {
        const start = new Date(startDate);
        const now = new Date();
        const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return months > 12 ? `${Math.floor(months / 12)} лет` : `${months} мес`;
    };

    const openEditDialog = (worker?: Worker) => {
        if (worker) {
            setEditingWorker(worker);
            setWorkerForm(worker);
        } else {
            setIsAddingWorker(true);
            // Явно инициализируем пустую форму
            setWorkerForm({
                name: '',
                phone: '',
                email: '',
                position: 'Клинер',
                startDate: new Date().toISOString().split('T')[0],
                photo: '',
                telegram: '',
                whatsapp: '',
                password: '',
                availability: {}
            });
        }
    };

    const createWorkerAccount = async (worker: Worker) => {
        if (!worker.email) {
            alert('У работника не указан email');
            return;
        }

        alert('Сначала создайте аккаунт в Firebase Console:\n\n1. Authentication → Add user\n2. Email: ' + worker.email + '\n3. Password: (ваш пароль)\n4. Скопируйте UID\n5. Firestore → workers → ' + worker.name + ' → Add field: uid = UID');
    };

    return (
        <Box sx={{ p: 3, bgcolor: (theme) => theme.palette.background.default, minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary }}>
                        Работники
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление командой клинеров и их расписанием
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportSchedule}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Экспорт расписания
                </Button>
            </Box>

            {/* Workers Grid */}
            <Grid container spacing={3}>
                {workers.map((worker) => (
                    <Grid item xs={12} md={6} lg={4} key={worker.id}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                {/* Header with Photo */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar 
                                        src={worker.photo} 
                                        sx={{ width: 56, height: 56, bgcolor: '#3b82f6', fontSize: '1.25rem' }}
                                    >
                                        {worker.name[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {worker.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                            <Chip 
                                                label={worker.position} 
                                                size="small" 
                                                sx={{ bgcolor: '#e0f2fe', color: '#0277bd' }}
                                            />
                                            <Chip 
                                                label={`ID: ${worker.id.slice(-6).toUpperCase()}`}
                                                size="small" 
                                                sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontFamily: 'monospace' }}
                                            />
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* Contact Info */}
                                <Stack spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.primary }}>{worker.phone}</Typography>
                                    </Box>
                                    {worker.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.primary }}>{worker.email}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WorkIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.primary }}>
                                            Работает {getWorkerExperience(worker.startDate)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Messengers */}
                                {(worker.telegram || worker.whatsapp) && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            Мессенджеры:
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            {worker.telegram && (
                                                <Chip 
                                                    icon={<TelegramIcon />} 
                                                    label={worker.telegram} 
                                                    size="small"
                                                    sx={{ bgcolor: '#e3f2fd' }}
                                                />
                                            )}
                                            {worker.whatsapp && (
                                                <Chip 
                                                    icon={<WhatsAppIcon />} 
                                                    label={worker.whatsapp} 
                                                    size="small"
                                                    sx={{ bgcolor: '#e8f5e8' }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Schedule Info */}
                                <Box sx={{ mb: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <ScheduleIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
                                            Расписание на месяц
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {Object.keys(worker.availability || {}).length} дней доступен
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Actions */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<ScheduleIcon />}
                                        onClick={() => setSelectedWorkerSchedule(worker)}
                                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                    >
                                        Расписание
                                    </Button>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => openEditDialog(worker)}
                                        sx={{ 
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9', 
                                            color: (theme) => theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6',
                                            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#475569' : '#e2e8f0' } 
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteWorker(worker.id)}
                                        sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' }, color: '#ef4444' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add/Edit Worker Dialog */}
            <Dialog 
                open={isAddingWorker || !!editingWorker} 
                onClose={() => {
                    setIsAddingWorker(false);
                    setEditingWorker(null);
                    // Очищаем форму полностью
                    setWorkerForm({
                        name: '',
                        phone: '',
                        email: '',
                        position: '',
                        startDate: '',
                        photo: '',
                        telegram: '',
                        whatsapp: '',
                        password: '',
                        availability: {}
                    });
                }}
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#f8fafc', color: (theme) => theme.palette.text.primary, borderBottom: (theme) => theme.palette.mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    {editingWorker ? 'Редактировать работника' : 'Добавить работника'}
                </DialogTitle>
                <DialogContent sx={{ pt: '24px !important' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="👤 Имя и фамилия *"
                                value={workerForm.name || ''}
                                onChange={(e) => setWorkerForm({...workerForm, name: e.target.value})}
                                required
                                placeholder="Анна Иванова"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Полное имя работника"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="📱 Телефон *"
                                value={workerForm.phone || ''}
                                onChange={(e) => setWorkerForm({...workerForm, phone: e.target.value})}
                                placeholder="+48 123 456 789"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Номер телефона для связи"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="📧 Email для входа"
                                value={workerForm.email || ''}
                                onChange={(e) => setWorkerForm({...workerForm, email: e.target.value})}
                                type="email"
                                placeholder="anna@example.com"
                                autoComplete="off"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Email для входа в систему"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="💼 Должность"
                                value={workerForm.position || ''}
                                onChange={(e) => setWorkerForm({...workerForm, position: e.target.value})}
                                placeholder="Клинер"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WorkIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Роль в компании"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="📅 Дата начала работы"
                                type="date"
                                value={workerForm.startDate || ''}
                                onChange={(e) => setWorkerForm({...workerForm, startDate: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Когда начал работать"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="📷 Фото (ссылка)"
                                value={workerForm.photo || ''}
                                onChange={(e) => setWorkerForm({...workerForm, photo: e.target.value})}
                                placeholder="https://example.com/photo.jpg"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhotoIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Ссылка на фото работника"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="💬 Telegram"
                                value={workerForm.telegram || ''}
                                onChange={(e) => setWorkerForm({...workerForm, telegram: e.target.value})}
                                placeholder="@username"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TelegramIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Никнейм в Telegram"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="💚 WhatsApp"
                                value={workerForm.whatsapp || ''}
                                onChange={(e) => setWorkerForm({...workerForm, whatsapp: e.target.value})}
                                placeholder="+48 123 456 789"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WhatsAppIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Номер WhatsApp"
                            />
                        </Grid>
                        
                        {!editingWorker && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="🔒 Пароль для входа (можно позже)"
                                    type={showPassword ? 'text' : 'password'}
                                    value={workerForm.password || ''}
                                    onChange={(e) => setWorkerForm({...workerForm, password: e.target.value})}
                                    placeholder="123456 (либо оставьте пустым)"
                                    autoComplete="new-password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: '#64748b' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText="Если указан email и пароль - аккаунт создастся сразу. Можно создать позже кнопкой."
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#f8fafc', borderTop: (theme) => theme.palette.mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <Button onClick={() => {
                        setIsAddingWorker(false);
                        setEditingWorker(null);
                        // Очищаем форму полностью
                        setWorkerForm({
                            name: '',
                            phone: '',
                            email: '',
                            position: '',
                            startDate: '',
                            photo: '',
                            telegram: '',
                            whatsapp: '',
                            password: '',
                            availability: {}
                        });
                    }}>
                        Отмена
                    </Button>
                    <Button onClick={handleSaveWorker} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Schedule Dialog */}
            <WorkerSchedule 
                worker={selectedWorkerSchedule}
                open={!!selectedWorkerSchedule}
                onClose={() => setSelectedWorkerSchedule(null)}
            />
        </Box>
    );
}