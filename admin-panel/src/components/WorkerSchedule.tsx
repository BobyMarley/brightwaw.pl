import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
    Grid, Paper, IconButton, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface WorkerScheduleProps {
    worker: any;
    open: boolean;
    onClose: () => void;
}

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function WorkerSchedule({ worker, open, onClose }: WorkerScheduleProps) {
    const [schedule, setSchedule] = useState<{ [date: string]: string[] }>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (worker?.availability) {
            setSchedule(worker.availability);
        }
    }, [worker]);

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
        return date.toISOString().split('T')[0];
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
        if (!worker) return;
        
        try {
            await updateDoc(doc(db, "workers", worker.id), {
                availability: schedule,
                updatedAt: new Date()
            });
            
            onClose();
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Ошибка сохранения расписания');
        }
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={isMobile}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon />
                Расписание работы - {worker?.name}
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {monthName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        >
                            ← Предыдущий
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        >
                            Следующий →
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={2}>
                    {days.map(day => {
                        const dateStr = formatDate(day);
                        const daySchedule = schedule[dateStr] || [];
                        const isToday = dateStr === formatDate(new Date());

                        return (
                            <Grid item xs={12} sm={6} md={4} key={dateStr}>
                                <Paper 
                                    sx={{ 
                                        p: 2, 
                                        bgcolor: isToday ? '#e3f2fd' : '#fff',
                                        border: isToday ? '2px solid #2196f3' : '1px solid #e0e0e0'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => addFullDay(dateStr)}
                                                title="Добавить весь день"
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                            {daySchedule.length > 0 && (
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => removeDay(dateStr)}
                                                    title="Удалить день"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
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
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {time}
                                                </Button>
                                            );
                                        })}
                                    </Box>

                                    {daySchedule.length > 0 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            {daySchedule.length} часов работы
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Статистика за месяц:
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="body2">
                            Рабочих дней: {Object.keys(schedule).length}
                        </Typography>
                        <Typography variant="body2">
                            Всего часов: {Object.values(schedule).reduce((sum, times) => sum + times.length, 0)}
                        </Typography>
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={saveSchedule} variant="contained">
                    Сохранить расписание
                </Button>
            </DialogActions>
        </Dialog>
    );
}