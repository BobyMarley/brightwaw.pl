import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Card, CardContent, Grid, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, 
    FormControl, Select, MenuItem, InputLabel, TextField, DialogActions, Stack, Avatar, Divider, Badge, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme, Autocomplete
} from '@mui/material';
import { 
    Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Event as EventIcon,
    Phone as PhoneIcon, Home as HomeIcon, AccessTime as TimeIcon, Person as PersonIcon,
    Comment as CommentIcon, Key as KeyIcon,
    ViewModule as ViewModuleIcon, ViewList as ViewListIcon, Add as AddIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersData);
            setError(null);
        }, (err) => {
            console.error("Error fetching orders:", err);
            if (err.code === 'permission-denied') {
                setError("Нет доступа к заказам. Ваша учетная запись не имеет прав администратора (согласно правилам базы).");
            } else {
                setError("Ошибка загрузки заказов: " + err.message);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const loadWorkers = async () => {
            const q = query(collection(db, "workers"), orderBy("name", "asc"));
            const snapshot = await getDocs(q);
            const workersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWorkers(workersData);
        };
        loadWorkers();
    }, []);

    useEffect(() => {
        if (editingOrder) {
            const formData = {
                status: editingOrder.status || 'new',
                date: editingOrder.dateSimplified || editingOrder.date || '',
                time: editingOrder.time || '',
                phone: editingOrder.phone || '',
                address: editingOrder.address || '',
                doorCode: editingOrder.doorCode || '',
                comments: editingOrder.comments || '',
                preferredContactTime: editingOrder.preferredContactTime || '',
                totalPrice: editingOrder.totalPrice || 0,
                type: editingOrder.type || 'standard',
                assignedWorkers: editingOrder.assignedWorkers || []
            };
            setEditForm(formData);
        } else if (isCreatingOrder) {
            setEditForm({
                status: 'new',
                date: '',
                time: '',
                phone: '',
                address: '',
                doorCode: '',
                comments: '',
                preferredContactTime: '',
                totalPrice: 0,
                type: 'standard',
                assignedWorkers: []
            });
        } else {
            setEditForm({});
        }
    }, [editingOrder, isCreatingOrder]);

    const handleStatusChange = async (newStatus: string, order?: any) => {
        const targetOrder = order || editingOrder;
        if (!targetOrder) return;
        
        await updateDoc(doc(db, "orders", targetOrder.id), { status: newStatus });
        if (!order) setEditingOrder(null);
    };

    const handleEditOrder = (order: any) => {
        setEditingOrder(order);
    };

    const handleCreateOrder = () => {
        setIsCreatingOrder(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.phone?.trim() || !editForm.address?.trim()) {
            alert('Укажите телефон и адрес');
            return;
        }
        
        const orderData = {
            status: editForm.status,
            date: editForm.date,
            dateSimplified: editForm.date,
            time: editForm.time,
            phone: editForm.phone.trim(),
            address: editForm.address.trim(),
            doorCode: editForm.doorCode,
            comments: editForm.comments,
            preferredContactTime: editForm.preferredContactTime,
            totalPrice: Number(editForm.totalPrice) || 0,
            type: editForm.type,
            assignedWorkers: editForm.assignedWorkers || [],
            updatedAt: serverTimestamp()
        };

        if (editingOrder) {
            await updateDoc(doc(db, "orders", editingOrder.id), orderData);
        } else {
            await addDoc(collection(db, "orders"), {
                ...orderData,
                userId: 'admin-created',
                userName: 'Админ',
                userEmail: 'admin@system',
                createdAt: serverTimestamp()
            });
        }
        
        setEditingOrder(null);
        setIsCreatingOrder(false);
        setEditForm({});
    };

    const handleSendToGoogleCalendar = (order: any) => {
        const startDateTime = `${order.dateSimplified}T${order.time}:00`;
        const endTime = order.time.split(':');
        const endHour = parseInt(endTime[0]) + 2; // +2 часа на уборку
        const endDateTime = `${order.dateSimplified}T${endHour.toString().padStart(2, '0')}:${endTime[1]}:00`;
        
        const title = `Уборка - ${order.userName || 'Клиент'}`;
        const details = `Тип: ${order.type}\nАдрес: ${order.address}\nТелефон: ${order.phone || order.userEmail}\nКод домофона: ${order.doorCode || 'не указан'}\nСумма: ${order.totalPrice} zł\nСтатус: ${order.status}\nКомментарии: ${order.comments || 'нет'}`;
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(order.address)}&ctz=Europe/Warsaw`;
        
        window.open(googleCalendarUrl, '_blank');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить заказ?')) {
            await deleteDoc(doc(db, "orders", id));
        }
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(orders.map(o => ({
            ID: o.id,
            Date: o.dateSimplified,
            Time: o.time,
            Address: o.address,
            Phone: o.phone || '',
            DoorCode: o.doorCode || '',
            Type: o.type,
            Price: o.totalPrice,
            Status: o.status,
            Client: o.userEmail,
            Comments: o.comments || '',
            PreferredContactTime: o.preferredContactTime || ''
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, "orders_export.xlsx");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'info';
            case 'confirmed': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatDetails = (order: any) => {
        if (order.type === 'dry') {
            return Object.entries(order.details || {})
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ');
        }
        return `${order.details?.rooms || 0} комн, ${order.details?.bathrooms || 0} сан.`;
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Заказы
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление заказами клининговых услуг
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1}>
                        <Button 
                            size="small"
                            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('cards')}
                            startIcon={<ViewModuleIcon />}
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            {!isMobile && 'Карточки'}
                        </Button>
                        <Button 
                            size="small"
                            variant={viewMode === 'table' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('table')}
                            startIcon={<ViewListIcon />}
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            {!isMobile && 'Таблица'}
                        </Button>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateOrder}
                        sx={{ 
                            bgcolor: '#3b82f6', 
                            '&:hover': { bgcolor: '#2563eb' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {isMobile ? '+' : 'Создать заказ'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={exportToExcel}
                        sx={{ 
                            bgcolor: '#10b981', 
                            '&:hover': { bgcolor: '#059669' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {isMobile ? 'Excel' : 'Экспорт в Excel'}
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 600, mb: 1 }}>
                        Ошибка доступа
                    </Typography>
                    <Typography sx={{ color: '#991b1b' }}>{error}</Typography>
                </Paper>
            )}

            {/* Orders Display */}
            {viewMode === 'cards' ? (
                <Grid container spacing={3}>
                    {orders.map((order) => (
                    <Grid item xs={12} md={6} lg={4} key={order.id}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                {/* Header with Status */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.875rem' }}>
                                            {(order.userName || 'U')[0].toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
                                                {order.userName || 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                #{order.id.slice(0, 6).toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status) as any}
                                        size="small"
                                        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                    />
                                </Box>

                                {/* Date & Time */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 2 }}>
                                    <TimeIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
                                        {order.dateSimplified} в {order.time || 'не указано'}
                                    </Typography>
                                </Box>

                                {/* Address */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                                    <HomeIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 20, mt: 0.2 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: (theme) => theme.palette.text.primary }}>
                                            {order.address}
                                        </Typography>
                                        {order.doorCode && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <KeyIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                                                    Код: {order.doorCode}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* Phone & Contact Time */}
                                {(order.phone || order.preferredContactTime) && (
                                    <Box sx={{ mb: 2 }}>
                                        {order.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <PhoneIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: (theme) => theme.palette.text.primary }}>
                                                    {order.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                        {order.preferredContactTime && (
                                            <Typography variant="caption" sx={{ color: (theme) => theme.palette.primary.main, fontWeight: 600, ml: 3 }}>
                                                Лучшее время: {order.preferredContactTime}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* Comments */}
                                {order.comments && (
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                                        <CommentIcon sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 18, mt: 0.2 }} />
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', flex: 1, color: (theme) => theme.palette.text.secondary }}>
                                            {order.comments.length > 100 ? order.comments.substring(0, 100) + '...' : order.comments}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Price & Type */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        {order.totalPrice} zł
                                    </Typography>
                                    <Chip 
                                        label={order.type} 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                </Box>

                                {/* Assigned Workers */}
                                {order.assignedWorkers && order.assignedWorkers.length > 0 && (
                                    <Box sx={{ mb: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e3a5f' : '#f0f9ff', borderRadius: 2, border: (theme) => theme.palette.mode === 'dark' ? '1px solid #2563eb' : '1px solid #bae6fd' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#60a5fa' : '#0369a1', mb: 1, display: 'block' }}>
                                            Работники ({order.assignedWorkers.length}):
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                            {order.assignedWorkers.map((workerId: string) => {
                                                const worker = workers.find((w: any) => w.id === workerId);
                                                return worker ? (
                                                    <Chip 
                                                        key={workerId}
                                                        label={worker.name}
                                                        size="small"
                                                        sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e40af' : '#e0f2fe', color: (theme) => theme.palette.mode === 'dark' ? '#bfdbfe' : '#0369a1' }}
                                                    />
                                                ) : null;
                                            })}
                                        </Stack>
                                    </Box>
                                )}

                                <Divider sx={{ mb: 2 }} />

                                {/* Actions */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {order.status === 'new' && (
                                        <>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                onClick={() => handleStatusChange('confirmed', order)}
                                                sx={{ 
                                                    bgcolor: '#10b981', 
                                                    '&:hover': { bgcolor: '#059669' },
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    borderRadius: 1.5
                                                }}
                                            >
                                                Подтвердить
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="error"
                                                onClick={() => handleStatusChange('cancelled', order)}
                                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                                            >
                                                Отменить
                                            </Button>
                                        </>
                                    )}
                                    
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleEditOrder(order)}
                                        sx={{ 
                                            bgcolor: '#f1f5f9', 
                                            '&:hover': { bgcolor: '#e2e8f0' },
                                            color: '#3b82f6'
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleSendToGoogleCalendar(order)}
                                        sx={{ 
                                            bgcolor: '#f1f5f9', 
                                            '&:hover': { bgcolor: '#e2e8f0' },
                                            color: '#8b5cf6'
                                        }}
                                    >
                                        <EventIcon fontSize="small" />
                                    </IconButton>
                                    
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDelete(order.id)}
                                        sx={{ 
                                            bgcolor: '#fef2f2', 
                                            '&:hover': { bgcolor: '#fee2e2' },
                                            color: '#ef4444'
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Клиент</TableCell>
                                <TableCell>Дата/Время</TableCell>
                                {!isMobile && <TableCell>Адрес</TableCell>}
                                <TableCell>Телефон</TableCell>
                                <TableCell>Тип</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                {(order.userName || 'U')[0].toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {order.userName || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    #{order.id.slice(0, 6).toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {order.dateSimplified}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.time || 'не указано'}
                                        </Typography>
                                    </TableCell>
                                    {!isMobile && (
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {order.address}
                                            </Typography>
                                            {order.doorCode && (
                                                <Typography variant="caption" sx={{ color: '#10b981' }}>
                                                    Код: {order.doorCode}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {order.phone || order.userEmail}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.type} 
                                            variant="outlined" 
                                            size="small"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                            {order.totalPrice} zł
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={getStatusColor(order.status) as any}
                                            size="small"
                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton size="small" onClick={() => handleEditOrder(order)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleSendToGoogleCalendar(order)}>
                                                <EventIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(order.id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog 
                open={!!editingOrder || isCreatingOrder} 
                onClose={() => {
                    setEditingOrder(null);
                    setIsCreatingOrder(false);
                    setEditForm({});
                }} 
                maxWidth="lg" 
                fullWidth
                scroll="body"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                        maxHeight: '90vh',
                        margin: 2
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#f8fafc',
                    color: (theme) => theme.palette.text.primary,
                    borderBottom: (theme) => theme.palette.mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#3b82f6' }}>
                            {isCreatingOrder ? <AddIcon /> : <EditIcon />}
                        </Avatar>
                        {isCreatingOrder ? 'Создать заказ' : `Редактировать заказ #${editingOrder?.id?.slice(0, 6)?.toUpperCase()}`}
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, overflow: 'visible', minHeight: 400, pt: '24px !important' }}>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Адрес *"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                placeholder="ul. Przykładowa 123, Warszawa"
                                required
                                error={!editForm.address?.trim()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Телефон *"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                placeholder="+48 123 456 789"
                                required
                                error={!editForm.phone?.trim()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Тип уборки</InputLabel>
                                <Select
                                    value={editForm.type || 'standard'}
                                    label="Тип уборки"
                                    onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="standard">Стандартная</MenuItem>
                                    <MenuItem value="deep">Генеральная</MenuItem>
                                    <MenuItem value="dry">Химчистка</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    value={editForm.status || 'new'}
                                    label="Статус"
                                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="new">Новый</MenuItem>
                                    <MenuItem value="confirmed">Подтвержден</MenuItem>
                                    <MenuItem value="in_progress">В работе</MenuItem>
                                    <MenuItem value="completed">Выполнен</MenuItem>
                                    <MenuItem value="cancelled">Отменен</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Дата"
                                type="date"
                                value={editForm.date || ''}
                                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Время"
                                type="time"
                                value={editForm.time || ''}
                                onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Код домофона"
                                value={editForm.doorCode || ''}
                                onChange={(e) => setEditForm({...editForm, doorCode: e.target.value})}
                                placeholder="1234"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Лучшее время связи</InputLabel>
                                <Select
                                    value={editForm.preferredContactTime || ''}
                                    label="Лучшее время связи"
                                    onChange={(e) => setEditForm({...editForm, preferredContactTime: e.target.value})}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="">Не указано</MenuItem>
                                    <MenuItem value="Утром (9-12)">Утром (9-12)</MenuItem>
                                    <MenuItem value="Днём (12-17)">Днём (12-17)</MenuItem>
                                    <MenuItem value="Вечером (17-20)">Вечером (17-20)</MenuItem>
                                    <MenuItem value="Любое время">Любое время</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Стоимость (злотые)"
                                type="number"
                                value={editForm.totalPrice || ''}
                                onChange={(e) => setEditForm({...editForm, totalPrice: e.target.value})}
                                placeholder="160"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">zł</InputAdornment>
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={workers}
                                getOptionLabel={(option: any) => option.name}
                                value={workers.filter((w: any) => (editForm.assignedWorkers || []).includes(w.id))}
                                onChange={(_, newValue) => {
                                    setEditForm({...editForm, assignedWorkers: newValue.map((w: any) => w.id)});
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Работники (1-6)"
                                        placeholder="Выберите работников"
                                    />
                                )}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Комментарии"
                                multiline
                                rows={4}
                                value={editForm.comments || ''}
                                onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                                placeholder="Дополнительные пожелания, комментарии..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#f8fafc', borderTop: (theme) => theme.palette.mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <Button 
                        onClick={() => {
                            setEditingOrder(null);
                            setIsCreatingOrder(false);
                            setEditForm({});
                        }}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleSaveEdit} 
                        variant="contained"
                        sx={{ 
                            bgcolor: '#3b82f6',
                            '&:hover': { bgcolor: '#2563eb' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        {isCreatingOrder ? 'Создать' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
