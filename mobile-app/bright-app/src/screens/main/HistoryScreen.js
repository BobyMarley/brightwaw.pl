import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
    scheduled: { label: 'Запланировано', icon: 'calendar-outline', color: '#3182CE' },
    inProgress: { label: 'Выполняется', icon: 'time-outline', color: '#D69E2E' },
    completed: { label: 'Завершено', icon: 'checkmark-circle-outline', color: '#38A169' },
    cancelled: { label: 'Отменено', icon: 'close-circle-outline', color: '#E53E3E' },
};

// Компонент счётчика статуса
const StatusCounter = ({ label, count, icon, isActive, onPress, colors }) => (
    <TouchableOpacity
        style={[
            styles.statusCounter,
            {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
            }
        ]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={20} color={isActive ? '#fff' : colors.textSecondary} />
        <Text style={[styles.statusCount, { color: isActive ? '#fff' : colors.text }]}>{count}</Text>
        <Text style={[styles.statusLabel, { color: isActive ? '#fff' : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
);

// Компонент карточки заказа
const OrderCard = ({ order, colors, onPress }) => {
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.scheduled;

    return (
        <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.orderHeader}>
                <View style={styles.orderDateContainer}>
                    <Ionicons name="calendar" size={16} color={colors.primary} />
                    <Text style={[styles.orderDate, { color: colors.text }]}>{order.date}</Text>
                    <Text style={[styles.orderTime, { color: colors.textSecondary }]}>{order.time}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                    <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
            </View>

            <Text style={[styles.orderType, { color: colors.text }]}>{order.type}</Text>

            <View style={styles.orderAddress}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.address}</Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={[styles.orderPrice, { color: colors.primary }]}>{order.price} zł</Text>
                <TouchableOpacity style={[styles.detailsButton, { borderColor: colors.primary }]} onPress={onPress}>
                    <Text style={[styles.detailsButtonText, { color: colors.primary }]}>Подробнее</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function HistoryScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Загрузка заказов из Firebase
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        console.log('Current user.uid:', user.uid);
        console.log('Querying orders for userId:', user.uid);

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        // Функция нормализации статуса из Firebase в наш формат
        const normalizeStatus = (status) => {
            if (!status) return 'scheduled';
            const s = status.toLowerCase();
            if (s === 'scheduled' || s === 'new' || s === 'pending' || s === 'запланировано' || s === 'новый') return 'scheduled';
            if (s === 'inprogress' || s === 'in_progress' || s === 'in progress' || s === 'выполняется' || s === 'processing') return 'inProgress';
            if (s === 'completed' || s === 'done' || s === 'завершено' || s === 'завершён' || s === 'выполнен') return 'completed';
            if (s === 'cancelled' || s === 'canceled' || s === 'отменено' || s === 'отменён') return 'cancelled';
            return 'scheduled'; // По умолчанию считаем запланированным
        };

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                console.log('Orders snapshot received:', snapshot.docs.length, 'documents');
                snapshot.docs.forEach(doc => {
                    console.log('Order doc:', doc.id, 'userId:', doc.data().userId);
                });
                const ordersData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const normalizedStatus = normalizeStatus(data.status);
                    // Преобразуем данные в нужный формат
                    // ВАЖНО: ...data идёт первым, чтобы наши значения не перезаписывались
                    return {
                        ...data,
                        id: doc.id,
                        type: data.serviceType || data.type || 'Уборка',
                        date: data.date || formatDate(data.createdAt?.toDate()),
                        time: data.time || '10:00',
                        price: data.totalPrice || data.price || 0,
                        status: normalizedStatus,
                        address: data.address || 'Адрес не указан',
                    };
                });
                setOrders(ordersData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching orders:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                alert('Ошибка загрузки заказов: ' + error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Форматирование даты
    const formatDate = (date) => {
        if (!date) return 'Дата не указана';
        return date.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Подсчёт заказов по статусам
    const counts = {
        all: orders.length,
        scheduled: orders.filter(o => o.status === 'scheduled').length,
        inProgress: orders.filter(o => o.status === 'inProgress').length,
        completed: orders.filter(o => o.status === 'completed' || o.status === 'cancelled').length,
    };

    // Фильтрация заказов
    const filteredOrders = activeFilter === 'all'
        ? orders
        : activeFilter === 'completed'
            ? orders.filter(o => o.status === 'completed' || o.status === 'cancelled')
            : orders.filter(o => o.status === activeFilter);

    // Навигация к деталям заказа
    const handleOrderPress = (order) => {
        navigation.navigate('OrderDetails', { order });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Загрузка заказов...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Хедер */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <Text style={styles.headerTitle}>Мои заказы</Text>
                <Text style={styles.headerSubtitle}>{user?.email}</Text>
            </View>

            {/* Счётчики статусов */}
            <View style={styles.countersContainer}>
                <StatusCounter
                    label="Все"
                    count={counts.all}
                    icon="list-outline"
                    isActive={activeFilter === 'all'}
                    onPress={() => setActiveFilter('all')}
                    colors={colors}
                />
                <StatusCounter
                    label="Новые"
                    count={counts.scheduled}
                    icon="calendar-outline"
                    isActive={activeFilter === 'scheduled'}
                    onPress={() => setActiveFilter('scheduled')}
                    colors={colors}
                />
                <StatusCounter
                    label="В работе"
                    count={counts.inProgress}
                    icon="time-outline"
                    isActive={activeFilter === 'inProgress'}
                    onPress={() => setActiveFilter('inProgress')}
                    colors={colors}
                />
                <StatusCounter
                    label="Готово"
                    count={counts.completed}
                    icon="checkmark-circle-outline"
                    isActive={activeFilter === 'completed'}
                    onPress={() => setActiveFilter('completed')}
                    colors={colors}
                />
            </View>

            {/* Список заказов */}
            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        colors={colors}
                        onPress={() => handleOrderPress(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {user ? 'Заказов пока нет' : 'Войдите, чтобы увидеть заказы'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
        marginTop: 4,
    },
    // Счётчики
    countersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    statusCounter: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    statusCount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statusLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    // Список
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    // Карточка заказа
    orderCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 }
        })
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderDate: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderTime: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderType: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    orderAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    addressText: {
        fontSize: 13,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(226, 232, 240, 0.3)',
    },
    orderPrice: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    detailsButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Пустой список
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
});
