import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

const STATUS_CONFIG = {
    scheduled: { label: 'Запланировано', icon: 'calendar-outline', color: '#3182CE' },
    inProgress: { label: 'Выполняется', icon: 'time-outline', color: '#D69E2E' },
    completed: { label: 'Завершено', icon: 'checkmark-circle-outline', color: '#38A169' },
    cancelled: { label: 'Отменено', icon: 'close-circle-outline', color: '#E53E3E' },
};

// Компонент строки информации
const InfoRow = ({ icon, label, value, colors }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
            <Ionicons name={icon} size={18} color={colors.textSecondary} />
            <Text style={[styles.infoLabelText, { color: colors.textSecondary }]}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
);

export default function OrderDetailsScreen({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const { order } = route.params;

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.scheduled;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Хедер */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Детали заказа</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Статус */}
                <View style={[styles.statusCard, { backgroundColor: statusConfig.color + '15' }]}>
                    <View style={[styles.statusIcon, { backgroundColor: statusConfig.color }]}>
                        <Ionicons name={statusConfig.icon} size={24} color="#fff" />
                    </View>
                    <View>
                        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                        <Text style={[styles.orderId, { color: colors.textSecondary }]}>Заказ #{order.id}</Text>
                    </View>
                </View>

                {/* Информация о заказе */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Информация</Text>

                    <InfoRow icon="briefcase-outline" label="Услуга" value={order.type || 'Уборка'} colors={colors} />
                    <InfoRow icon="calendar-outline" label="Дата" value={order.date || 'Не указана'} colors={colors} />
                    <InfoRow icon="time-outline" label="Время" value={order.time || 'Не указано'} colors={colors} />
                    <InfoRow icon="location-outline" label="Адрес" value={order.address || 'Не указан'} colors={colors} />
                </View>

                {/* Стоимость */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Стоимость</Text>

                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Услуга</Text>
                        <Text style={[styles.priceValue, { color: colors.text }]}>{order.price || 0} zł</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.priceRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Итого</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>{order.price || 0} zł</Text>
                    </View>
                </View>

                {/* Действия */}
                {order.status === 'scheduled' && (
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.cancelButton, { borderColor: '#E53E3E' }]}>
                            <Text style={[styles.cancelButtonText, { color: '#E53E3E' }]}>Отменить заказ</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    // Статус
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
    },
    statusIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderId: {
        fontSize: 13,
        marginTop: 2,
    },
    // Карточки
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 }
        })
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    // Строка информации
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabelText: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        maxWidth: '50%',
        textAlign: 'right',
    },
    // Цены
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 14,
    },
    priceValue: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    // Действия
    actions: {
        marginTop: 8,
    },
    cancelButton: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
