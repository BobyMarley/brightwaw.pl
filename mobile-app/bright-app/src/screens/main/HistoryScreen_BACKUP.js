import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Container from '../../components/common/Container';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { Ionicons } from '@expo/vector-icons';

const MOCK_ORDERS = [
    { id: '1', date: '2025-12-08', type: 'Стандартная уборка', price: 200, status: 'Completed', address: 'ul. Wronia 45' },
    { id: '2', date: '2025-11-20', type: 'Генеральная уборка', price: 450, status: 'Completed', address: 'ul. Marszałkowska 10' },
    { id: '3', date: '2025-11-05', type: 'Химчистка', price: 150, status: 'Cancelled', address: 'ul. Wronia 45' },
];

export default function HistoryScreen() {
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={[
                    styles.status,
                    { color: item.status === 'Completed' ? Colors.success : Colors.error }
                ]}>{item.status}</Text>
            </View>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <Text style={styles.price}>{item.price} zł</Text>
        </View>
    );

    return (
        <Container>
            <View style={styles.header}>
                <Text style={styles.title}>Мои заказы</Text>
            </View>
            <FlatList
                data={MOCK_ORDERS}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: Typography.h2, fontWeight: Typography.bold, color: Colors.text },
    list: { padding: 24 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    date: { color: Colors.textSecondary, fontSize: Typography.caption },
    status: { fontWeight: Typography.medium, fontSize: Typography.caption },
    type: { fontSize: Typography.body, fontWeight: Typography.bold, color: Colors.text, marginBottom: 4 },
    address: { color: Colors.textSecondary, fontSize: Typography.caption, marginBottom: 12 },
    price: { fontSize: Typography.h3, fontWeight: Typography.bold, color: Colors.primary },
});
