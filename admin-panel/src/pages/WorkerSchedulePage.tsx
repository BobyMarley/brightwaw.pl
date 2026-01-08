import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Grid, Stack, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function WorkerSchedulePage() {
    const { user } = useAuth();
    const [worker, setWorker] = useState<any>(null);
    const [schedule, setSchedule] = useState<{ [date: string]: string[] }>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user?.email) return;

        const findWorker = async () => {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const workersRef = collection(db, 'workers');
            const q = query(workersRef, where('email', '==', user.email));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                const workerDoc = snapshot.docs[0];
                const workerData = { id: workerDoc.id, ...workerDoc.data() };
                setWorker(workerData);
                setSchedule(workerData.availability || {});
                
                const unsubscribe = onSnapshot(doc(db, 'workers', workerDoc.id), (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setSchedule(data.availability || {});
                    }
                });
                
                return unsubscribe;
            }
        };

        findWorker();
    }, [user]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        return days;
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const toggleTimeSlot = (date: string, time: string) => {
        setSchedule(prev => {
            const daySchedule = prev[date] || [];
            const newDaySchedule = daySchedule.includes(time)
                ? daySchedule.filter(t => t !== time)
                : [...daySchedule, time].sort();
            
            if (newDaySchedule.length === 0) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }
            
            return { ...prev, [date]: newDaySchedule };
        });
    };

    const addFullDay = (date: string) => {
        setSchedule(prev => ({
            ...prev,
            [date]: [...timeSlots]
        }));
    };

    const removeDay = (date: string) => {
        setSchedule(prev => {
            const { [date]: _, ...rest } = prev;
            return rest;
        });
    };

    const saveSchedule = async () => {
        if (!worker?.id) return;
        
        setSaving(true);
        try {
            await updateDoc(doc(db, "workers", worker.id), {
                availability: schedule,
                updatedAt: new Date()
            });
            
            setMessage('Расписание сохранено');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving schedule:', error);
            setMessage('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    if (!worker) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', overflow: 'hidden' }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: (theme) => theme.palette.text.primary }}>
                Мое расписание
            </Typography>

            {message && (
                <Alert severity={message.includes('Ошибка') ? 'error' : 'success'} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {/* Month Navigation */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: (theme) => theme.palette.text.primary }}>
                        {monthName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            sx={{ minWidth: { xs: 'auto', sm: 'auto' }, px: { xs: 1, sm: 2 } }}
                        >
                            ←
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            sx={{ minWidth: { xs: 'auto', sm: 'auto' }, px: { xs: 1, sm: 2 } }}
                        >
                            →
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Calendar Grid */}
            <Grid container spacing={1}>
                {days.map(day => {
                    const dateStr = formatDate(day);
                    const daySchedule = schedule[dateStr] || [];
                    const isToday = dateStr === formatDate(new Date());
                    
                    if (day.getDate() === 16) {
                        console.log('16 декабря:', { dateStr, isToday, todayStr: formatDate(new Date()), daySchedule });
                    }

                    return (
                        <Grid item xs={12} sm={6} md={4} key={dateStr}>
                            <Paper 
                                sx={{ 
                                    p: { xs: 1, sm: 2 }, 
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    minHeight: { xs: 'auto', sm: '200px' }
                                }}
                            >
                                {/* Day Header */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, color: (theme) => theme.palette.text.primary }}>
                                        {day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5}>
                                        <Button 
                                            size="small" 
                                            onClick={() => addFullDay(dateStr)}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </Button>
                                        {daySchedule.length > 0 && (
                                            <Button 
                                                size="small" 
                                                onClick={() => removeDay(dateStr)}
                                                color="error"
                                                sx={{ minWidth: 'auto', p: 0.5 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>

                                {/* Time Slots */}
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, 
                                    gap: 0.5 
                                }}>
                                    {timeSlots.map(time => {
                                        const isSelected = daySchedule.includes(time);
                                        return (
                                            <Button
                                                key={time}
                                                size="small"
                                                onClick={() => toggleTimeSlot(dateStr, time)}
                                                variant={isSelected ? 'contained' : 'outlined'}
                                                sx={{ 
                                                    minWidth: 'auto',
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                    p: { xs: 0.5, sm: 1 }
                                                }}
                                            >
                                                {time}
                                            </Button>
                                        );
                                    })}
                                </Box>

                                {daySchedule.length > 0 && (
                                    <Typography 
                                        variant="caption" 
                                        color="primary" 
                                        sx={{ mt: 1, display: 'block', textAlign: 'center', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                        {daySchedule.length} ч.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Statistics */}
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
                    Статистика за месяц:
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: (theme) => theme.palette.text.primary }}>
                        Дней: {Object.keys(schedule).length}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: (theme) => theme.palette.text.primary }}>
                        Часов: {Object.values(schedule).reduce((sum, times) => sum + times.length, 0)}
                    </Typography>
                </Stack>
            </Paper>

            {/* Save Button */}
            <Box sx={{ position: 'fixed', bottom: { xs: 80, md: 20 }, right: 20, zIndex: 1000 }}>
                <Button
                    variant="contained"
                    onClick={saveSchedule}
                    disabled={saving}
                    startIcon={<SaveIcon />}
                    sx={{ 
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </Box>
        </Box>
    );
}