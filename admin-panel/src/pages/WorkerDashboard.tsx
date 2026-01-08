import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Card, CardContent, Grid, Button, Avatar, Chip, Stack, Divider,
    useMediaQuery, useTheme, Container, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
    Schedule as ScheduleIcon, Phone as PhoneIcon, Email as EmailIcon,
    ViewModule as ViewModuleIcon, ViewList as ViewListIcon
} from '@mui/icons-material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WorkerProfileEdit from '../components/WorkerProfileEdit';

export default function WorkerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [worker, setWorker] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [allWorkers, setAllWorkers] = useState<any[]>([]);
    const [editingProfile, setEditingProfile] = useState(false);
    const [ordersViewMode, setOrdersViewMode] = useState<'cards' | 'table'>('cards');
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!user?.email) return;

        const findWorker = async () => {
            try {
                const { collection, query, where, getDocs } = await import('firebase/firestore');
                const workersRef = collection(db, 'workers');
                const q = query(workersRef, where('email', '==', user.email));
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    const workerDoc = snapshot.docs[0];
                    const workerData = { id: workerDoc.id, ...workerDoc.data() };
                    setWorker(workerData);
                    
                    const unsubscribeWorker = onSnapshot(doc(db, 'workers', workerDoc.id), (doc) => {
                        if (doc.exists()) {
                            setWorker({ id: doc.id, ...doc.data() });
                        }
                    });
                    
                    // Загружаем всех работников
                    const workersSnapshot = await getDocs(collection(db, 'workers'));
                    const workersData = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setAllWorkers(workersData);
                    
                    const ordersRef = collection(db, 'orders');
                    
                    // Загружаем ВСЕ заказы и фильтруем на клиенте
                    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
                        const allOrders = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        
                        // Фильтруем заказы где работник назначен
                        const myOrders = allOrders.filter(order => {
                            // Проверяем новое поле assignedWorkers (массив)
                            if (order.assignedWorkers && Array.isArray(order.assignedWorkers)) {
                                return order.assignedWorkers.includes(workerDoc.id);
                            }
                            // Проверяем старое поле assignedWorkerId
                            if (order.assignedWorkerId === workerDoc.id) {
                                return true;
                            }
                            return false;
                        }).sort((a, b) => {
                            const dateA = new Date(a.dateSimplified || a.date);
                            const dateB = new Date(b.dateSimplified || b.date);
                            return dateA.getTime() - dateB.getTime();
                        });
                        
                        console.log('=== DEBUG INFO ===');
                        console.log('Worker ID:', workerDoc.id);
                        console.log('Worker Email:', user.email);
                        console.log('Total orders:', allOrders.length);
                        console.log('My orders:', myOrders.length);
                        
                        // Выводим детали каждого заказа
                        allOrders.forEach((order, idx) => {
                            console.log(`Order ${idx + 1}:`, {
                                id: order.id,
                                assignedWorkers: order.assignedWorkers,
                                assignedWorkerId: order.assignedWorkerId,
                                hasWorker: order.assignedWorkers?.includes(workerDoc.id) || order.assignedWorkerId === workerDoc.id
                            });
                        });
                        console.log('==================');
                        
                        setOrders(myOrders);
                    });
                    
                    return () => {
                        unsubscribeWorker();
                        unsubscribeOrders();
                    };
                }
            } catch (error) {
                console.error('Error finding worker:', error);
            } finally {
                setLoading(false);
            }
        };

        findWorker();
    }, [user]);

    const getWorkerExperience = (startDate: string) => {
        if (!startDate) return 'Не указано';
        const start = new Date(startDate);
        const now = new Date();
        const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return months > 12 ? `${Math.floor(months / 12)} лет` : `${months} мес`;
    };

    const getScheduleStats = () => {
        if (!worker?.availability) return { days: 0, hours: 0 };
        const days = Object.keys(worker.availability).length;
        const hours = Object.values(worker.availability).reduce((sum: number, times: any) => sum + times.length, 0);
        return { days, hours };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }

    if (!worker) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Профиль работника не найден
                </Typography>
                <Typography color="text.secondary">
                    Обратитесь к менеджеру для создания профиля
                </Typography>
            </Box>
        );
    }

    const stats = getScheduleStats();

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative' }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                        }}
                    >
                        Мой кабинет
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управляйте своим расписанием и профилем
                    </Typography>
                </Box>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} lg={4}>
                        <Card sx={{ borderRadius: 3, height: 'fit-content' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                                <Avatar 
                                    src={worker.photo} 
                                    sx={{ 
                                        width: { xs: 60, sm: 80 }, 
                                        height: { xs: 60, sm: 80 }, 
                                        bgcolor: '#3b82f6', 
                                        fontSize: { xs: '1.5rem', sm: '2rem' },
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    {worker.name?.[0]?.toUpperCase()}
                                </Avatar>
                                
                                <Typography 
                                    variant={isMobile ? "h6" : "h5"} 
                                    sx={{ fontWeight: 600, mb: 1 }}
                                >
                                    {worker.name}
                                </Typography>
                                
                                <Chip 
                                    label={worker.position || 'Клинер'} 
                                    sx={{ 
                                        bgcolor: '#e0f2fe', 
                                        color: '#0277bd', 
                                        mb: 2,
                                        fontWeight: 500
                                    }}
                                />
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Работает {getWorkerExperience(worker.startDate)}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <PhoneIcon sx={{ color: '#64748b', fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {worker.phone}
                                        </Typography>
                                    </Box>
                                    {worker.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <EmailIcon sx={{ color: '#64748b', fontSize: 18 }} />
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {worker.email}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                                
                                <Button
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
                                    onClick={() => setEditingProfile(true)}
                                    sx={{ 
                                        mt: 3, 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        width: '100%'
                                    }}
                                >
                                    Редактировать профиль
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={8}>
                        <Stack spacing={{ xs: 2, sm: 3 }}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                    <Typography 
                                        variant={isMobile ? "subtitle1" : "h6"} 
                                        sx={{ fontWeight: 600, mb: 3 }}
                                    >
                                        Статистика за месяц
                                    </Typography>
                                    
                                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                                        <Grid item xs={3}>
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                p: { xs: 1.5, sm: 2 }, 
                                                bgcolor: '#f1f5f9', 
                                                borderRadius: 2 
                                            }}>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    sx={{ fontWeight: 700, color: '#3b82f6' }}
                                                >
                                                    {stats.days}
                                                </Typography>
                                                <Typography 
                                                    variant={isMobile ? "caption" : "body2"} 
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                                >
                                                    Раб. дней
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                p: { xs: 1.5, sm: 2 }, 
                                                bgcolor: '#f0fdf4', 
                                                borderRadius: 2 
                                            }}>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    sx={{ fontWeight: 700, color: '#10b981' }}
                                                >
                                                    {stats.hours}
                                                </Typography>
                                                <Typography 
                                                    variant={isMobile ? "caption" : "body2"} 
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                                >
                                                    Часов
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                p: { xs: 1.5, sm: 2 }, 
                                                bgcolor: '#fef3e2', 
                                                borderRadius: 2 
                                            }}>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    sx={{ fontWeight: 700, color: '#f59e0b' }}
                                                >
                                                    {stats.days > 0 ? Math.round(stats.hours / stats.days * 10) / 10 : 0}
                                                </Typography>
                                                <Typography 
                                                    variant={isMobile ? "caption" : "body2"} 
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                                >
                                                    Ч/день
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Box sx={{ 
                                                textAlign: 'center', 
                                                p: { xs: 1.5, sm: 2 }, 
                                                bgcolor: '#fef2f2', 
                                                borderRadius: 2 
                                            }}>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    sx={{ fontWeight: 700, color: '#ef4444' }}
                                                >
                                                    {orders.length}
                                                </Typography>
                                                <Typography 
                                                    variant={isMobile ? "caption" : "body2"} 
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                                                >
                                                    Заказов
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'space-between', 
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 2
                                    }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography 
                                                variant={isMobile ? "subtitle1" : "h6"} 
                                                sx={{ fontWeight: 600, mb: 1 }}
                                            >
                                                Мое расписание
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Выберите дни и время когда вы готовы работать
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            startIcon={<ScheduleIcon />}
                                            onClick={() => navigate('/schedule')}
                                            size={isMobile ? "medium" : "large"}
                                            sx={{ 
                                                bgcolor: '#3b82f6', 
                                                '&:hover': { bgcolor: '#2563eb' },
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                px: { xs: 2, sm: 3 },
                                                py: { xs: 1, sm: 1.5 },
                                                minWidth: { xs: '100%', sm: 'auto' }
                                            }}
                                        >
                                            {isMobile ? 'Расписание' : 'Перейти к расписанию'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography 
                                        variant={isMobile ? "subtitle1" : "h6"} 
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Мои заказы ({orders.length})
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button 
                                            size="small"
                                            variant={ordersViewMode === 'cards' ? 'contained' : 'outlined'}
                                            onClick={() => setOrdersViewMode('cards')}
                                            startIcon={<ViewModuleIcon />}
                                            sx={{ minWidth: 'auto', px: 2 }}
                                        >
                                            {!isMobile && 'Карточки'}
                                        </Button>
                                        <Button 
                                            size="small"
                                            variant={ordersViewMode === 'table' ? 'contained' : 'outlined'}
                                            onClick={() => setOrdersViewMode('table')}
                                            startIcon={<ViewListIcon />}
                                            sx={{ minWidth: 'auto', px: 2 }}
                                        >
                                            {!isMobile && 'Таблица'}
                                        </Button>
                                    </Stack>
                                </Box>
                                
                                {orders.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                                        <Typography color="text.secondary">
                                            Нет назначенных заказов
                                        </Typography>
                                    </Box>
                                ) : ordersViewMode === 'cards' ? (
                                    <Stack spacing={2}>
                                        {orders.slice(0, 5).map((order) => (
                                            <Paper 
                                                key={order.id} 
                                                sx={{ 
                                                    p: { xs: 2, sm: 3 }, 
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    justifyContent: 'space-between', 
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    gap: { xs: 2, sm: 0 }
                                                }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            sx={{ fontWeight: 600, mb: 0.5 }}
                                                        >
                                                            Заказ #{order.id.slice(-6).toUpperCase()}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{ mb: 0.5 }}
                                                        >
                                                            {order.address}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                            📅 {order.dateSimplified || order.date} ⏰ {order.time}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#10b981' }}>
                                                            💰 {order.totalPrice} zł • {order.type === 'standard' ? 'Стандарт' : order.type === 'deep' ? 'Генеральная' : order.type === 'dry' ? 'Химчистка' : order.type}
                                                        </Typography>
                                                        {order.phone && (
                                                            <Typography variant="body2" sx={{ mt: 0.5, color: '#64748b' }}>
                                                                📞 {order.phone}
                                                            </Typography>
                                                        )}
                                                        {order.comments && (
                                                            <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#fef3c7', borderRadius: 1, fontStyle: 'italic' }}>
                                                                💬 {order.comments}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                                                        <Chip 
                                                            label={order.status === 'new' ? 'Новый' : 
                                                                   order.status === 'confirmed' ? 'Подтвержден' :
                                                                   order.status === 'in_progress' ? 'В работе' :
                                                                   order.status === 'completed' ? 'Выполнен' : 
                                                                   order.status === 'cancelled' ? 'Отменен' : order.status}
                                                            color={order.status === 'completed' ? 'success' : 
                                                                   order.status === 'in_progress' ? 'warning' : 
                                                                   order.status === 'cancelled' ? 'error' : 'primary'}
                                                            size={isMobile ? "small" : "medium"}
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                minWidth: { xs: '100%', sm: 'auto' },
                                                                justifyContent: 'center'
                                                            }}
                                                        />
                                                        {order.assignedWorkers && order.assignedWorkers.length > 0 && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                                                                    Команда:
                                                                </Typography>
                                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                                    {order.assignedWorkers.map((wId: string) => {
                                                                        const w = allWorkers.find(worker => worker.id === wId);
                                                                        return w ? (
                                                                            <Chip 
                                                                                key={wId}
                                                                                label={w.name}
                                                                                size="small"
                                                                                sx={{ 
                                                                                    bgcolor: '#f0f9ff',
                                                                                    color: '#0369a1',
                                                                                    fontWeight: 500,
                                                                                    fontSize: '0.7rem'
                                                                                }}
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))}
                                        {orders.length > 5 && (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                sx={{ textAlign: 'center', mt: 2 }}
                                            >
                                                и ещё {orders.length - 5} заказов...
                                            </Typography>
                                        )}
                                    </Stack>
                                ) : (
                                    <TableContainer component={Paper}>
                                        <Table size={isMobile ? 'small' : 'medium'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Заказ</TableCell>
                                                    {!isMobile && <TableCell>Адрес</TableCell>}
                                                    <TableCell>Дата</TableCell>
                                                    <TableCell>Цена</TableCell>
                                                    <TableCell>Статус</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {orders.slice(0, 10).map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                #{order.id.slice(-6).toUpperCase()}
                                                            </Typography>
                                                            {isMobile && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {order.address}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        {!isMobile && (
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {order.address}
                                                                </Typography>
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {order.dateSimplified || order.date}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {order.time}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {order.totalPrice} zł
                                                            </Typography>
                                                            {order.comments && (
                                                                <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mt: 0.5 }}>
                                                                    💬 {order.comments.substring(0, 30)}{order.comments.length > 30 ? '...' : ''}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack spacing={0.5}>
                                                                <Chip 
                                                                    label={order.status === 'new' ? 'Новый' : 
                                                                           order.status === 'confirmed' ? 'Подтвержден' :
                                                                           order.status === 'in_progress' ? 'В работе' :
                                                                           order.status === 'completed' ? 'Выполнен' : 
                                                                           order.status === 'cancelled' ? 'Отменен' : order.status}
                                                                    color={order.status === 'completed' ? 'success' : 
                                                                           order.status === 'in_progress' ? 'warning' : 
                                                                           order.status === 'cancelled' ? 'error' : 'primary'}
                                                                    size="small"
                                                                    sx={{ fontWeight: 600 }}
                                                                />
                                                                {order.assignedWorkers && order.assignedWorkers.length > 0 && (
                                                                    <Box sx={{ mt: 0.5 }}>
                                                                        {order.assignedWorkers.map((wId: string) => {
                                                                            const w = allWorkers.find(worker => worker.id === wId);
                                                                            return w ? (
                                                                                <Typography key={wId} variant="caption" sx={{ color: '#0369a1', fontSize: '0.65rem', display: 'block' }}>
                                                                                    👤 {w.name}
                                                                                </Typography>
                                                                            ) : null;
                                                                        })}
                                                                    </Box>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {editingProfile && (
                <WorkerProfileEdit 
                    worker={worker}
                    open={editingProfile}
                    onClose={() => setEditingProfile(false)}
                    onSave={(updatedWorker) => {
                        setWorker(updatedWorker);
                        setEditingProfile(false);
                    }}
                />
            )}
        </Box>
    );
}