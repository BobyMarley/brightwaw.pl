import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import SuccessModal from '../../components/common/SuccessModal';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import DateTimePicker from '../../components/booking/DateTimePicker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Pricing Data
const TYPE_PRICES = {
    standard: {
        1: 160, 2: 190, 3: 230, 4: 280, 5: 320,
        extraBath: 50
    },
    general: {
        1: 510, 2: 620, 3: 770, 4: 900, 5: 1050,
        extraBath: 100
    },
    renovation: {
        1: 510, 2: 620, 3: 770, 4: 900, 5: 1050,
        extraBath: 100
    }
};

const EXTRAS_DATA = [
    { id: 'window', name: 'Мытьё окна', price: 35, icon: 'grid-outline' },
    { id: 'balcony', name: 'Уборка балкона', price: 35, icon: 'sunny-outline' },
    { id: 'cupboard', name: 'Уборка в шкафах', price: 40, icon: 'file-tray-full-outline', excludedIn: ['general', 'renovation', 'dry'] },
    { id: 'oven', name: 'Мытьё духовки', price: 45, icon: 'restaurant-outline', excludedIn: ['general', 'renovation', 'dry'] },
    { id: 'hood', name: 'Чистка вытяжки', price: 40, icon: 'cloud-upload-outline', excludedIn: ['general', 'renovation', 'dry'] },
    { id: 'microwave', name: 'Микроволновка', price: 15, icon: 'hardware-chip-outline', excludedIn: ['dry'] },
    { id: 'fridge', name: 'Холодильник', price: 35, icon: 'snow-outline', excludedIn: ['general', 'renovation', 'dry'] },
    { id: 'dishes', name: 'Посуда (вручную)', price: 20, icon: 'water-outline', excludedIn: ['dry'] },
    { id: 'litter', name: 'Кошачий лоток', price: 20, icon: 'paw-outline', excludedIn: ['dry'] },
    { id: 'ironing', name: 'Глажка (час)', price: 50, icon: 'shirt-outline', excludedIn: ['dry'] },
];

const DRY_CLEANING_ITEMS = [
    { id: 'sofa', name: 'Диван', price: 160, icon: 'bed-outline', unit: 'шт' },
    { id: 'carpet', name: 'Ковёр (м²)', price: 15, icon: 'albums-outline', unit: 'м²' },
    { id: 'mattress', name: 'Матрас', price: 90, icon: 'browsers-outline', unit: 'шт' },
    { id: 'armchair', name: 'Кресло', price: 40, icon: 'easel-outline', unit: 'шт' },
    { id: 'stool', name: 'Стул', price: 20, icon: 'cafe-outline', unit: 'шт' },
];

const TABS = [
    { id: 'standard', title: 'Стандарт' },
    { id: 'general', title: 'Генеральная' },
    { id: 'renovation', title: 'Ремонт' },
    { id: 'dry', title: 'Химчистка' },
];

const TIME_SLOTS = [];
for (let h = 7; h <= 20; h++) {
    TIME_SLOTS.push(`${h < 10 ? '0' + h : h}:00`);
    if (h !== 20) TIME_SLOTS.push(`${h < 10 ? '0' + h : h}:30`);
}

export default function CalculatorScreen({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const scrollViewRef = useRef(null);
    const addressRef = useRef(null);
    const phoneRef = useRef(null);
    const dateTimeRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState('standard');
    const [rooms, setRooms] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    const [extras, setExtras] = useState({});
    const [dryCleaning, setDryCleaning] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [selectedDateTime, setSelectedDateTime] = useState({ date: null, time: null });
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState(false);
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState(false);
    const [doorCode, setDoorCode] = useState('');
    const [comments, setComments] = useState('');
    const [preferredContactTime, setPreferredContactTime] = useState('');
    const [dateTimeError, setDateTimeError] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState([]);

    // Address selection modal (simple version: just list below input for now)

    // Feedback: Loading State is handled, but Alert might be blocked or subtle.
    // Let's ensure navigation happens only AFTER user confirms, but also show a better UI feedback if possible.

    useEffect(() => {
        if (route.params?.type) {
            if (route.params.type === 'deep') setActiveTab('general');
            else if (route.params.type === 'dry') { setActiveTab('dry'); }
            else setActiveTab(route.params.type);
        }
    }, [route.params]);




    const updateExtra = (id, delta) => {
        setExtras(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const updateDry = (id, delta) => {
        setDryCleaning(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const calculateTotal = () => {
        let total = 0;

        if (activeTab === 'dry') {
            Object.entries(dryCleaning).forEach(([id, count]) => {
                const item = DRY_CLEANING_ITEMS.find(e => e.id === id);
                if (item) total += item.price * count;
            });
        } else {
            const baseMap = TYPE_PRICES[activeTab] || TYPE_PRICES.standard;
            const safeRooms = Math.min(Math.max(1, rooms), 5);
            total = baseMap[safeRooms] || 160;

            if (bathrooms > 1) {
                total += (bathrooms - 1) * baseMap.extraBath;
            }

            Object.entries(extras).forEach(([id, count]) => {
                const item = EXTRAS_DATA.find(e => e.id === id);
                if (item && !item.excludedIn?.includes(activeTab)) {
                    total += item.price * count;
                }
            });
        }

        return total;
    };

    const handleOrder = async () => {
        console.log('handleOrder function called');
        
        // Reset errors
        setAddressError(false);
        setPhoneError(false);
        setDateTimeError(false);

        console.log('Checking auth...', !!user);
        if (!user) {
            console.log('No auth user - showing alert');
            Alert.alert('Требуется авторизация', 'Пожалуйста, войдите или зарегистрируйтесь, чтобы оформить заказ.');
            return;
        }

        console.log('Checking dry cleaning...', activeTab, Object.keys(dryCleaning).length);
        if (activeTab === 'dry' && Object.keys(dryCleaning).length === 0) {
            console.log('Empty dry cleaning - showing alert');
            Alert.alert('Пустой заказ', 'Выберите хотя бы одну услугу для химчистки.');
            return;
        }

        if (!address.trim()) {
            setAddressError(true);
            addressRef.current?.focus();
            return;
        }

        if (!phone.trim()) {
            setPhoneError(true);
            phoneRef.current?.focus();
            return;
        }

        if (!selectedDateTime || !selectedDateTime.date || !selectedDateTime.time) {
            setDateTimeError(true);
            scrollViewRef.current?.scrollToEnd({ animated: true });
            return;
        }
        
        console.log('All validations passed, proceeding...');

        const total = calculateTotal();
        setLoading(true);

        try {
            console.log('Starting order creation...');
            console.log('User:', user?.uid, user?.email);
            
            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.name || 'Клиент',
                type: activeTab,
                details: activeTab === 'dry' ? dryCleaning : { rooms, bathrooms, extras },
                totalPrice: total,
                status: 'new',
                createdAt: serverTimestamp(),
                address: address,
                phone: phone.trim(),
                doorCode: doorCode.trim(),
                comments: comments.trim(),
                preferredContactTime: preferredContactTime,
                dateSimplified: selectedDateTime.date,
                date: selectedDateTime.date,
                time: selectedDateTime.time,
                platform: Platform.OS
            };

            console.log('Order data:', orderData);
            console.log('Sending to Firestore...');
            
            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log('Order created successfully:', docRef.id);

            setLoading(false);
            setShowSuccessModal(true);

        } catch (e) {
            setLoading(false);
            console.error("Order Error: ", e);
            Alert.alert('Ошибка', 'Не удалось отправить заказ: ' + e.message);
        }
    };

    const getFilteredExtras = () => {
        return EXTRAS_DATA.filter(item => !item.excludedIn?.includes(activeTab));
    };


    return (
        <Container>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Калькулятор заказа</Text>
            </View>

            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalTabs}>
                    <View style={styles.tabsContainer}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setActiveTab(tab.id)}
                                    style={[
                                        styles.tab, 
                                        { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                                        isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                >
                                    <Text style={[
                                        styles.tabText, 
                                        { color: colors.textSecondary },
                                        isActive && { color: colors.textInverse }
                                    ]}>
                                        {tab.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {activeTab !== 'dry' ? (
                    /* Standard/General/Renovation Logic */
                    <>
                        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Параметры квартиры</Text>
                            <CounterRow
                                label="Комнаты"
                                value={rooms}
                                onChange={setRooms}
                                min={1}
                                max={5}
                                suffix={rooms === 1 ? "комната" : "комнаты"}
                                colors={colors}
                            />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <CounterRow
                                label="Санузлы"
                                value={bathrooms}
                                onChange={setBathrooms}
                                min={1}
                                max={5}
                                suffix={bathrooms === 1 ? "санузел" : "санузла"}
                                colors={colors}
                            />
                        </View>

                        {(activeTab === 'general' || activeTab === 'renovation') && (
                            <View style={[styles.includedCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                                <Text style={[styles.includedTitle, { color: colors.primary }]}>Включено в стоимость:</Text>
                                <View style={styles.includedTags}>
                                    {["Духовка", "Холодильник", "Шкафы", "Вытяжка"].map(t => (
                                        <View key={t} style={[styles.tag, { backgroundColor: colors.surface }]}><Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text></View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <Text style={[styles.listHeader, { color: colors.text }]}>Дополнительные услуги</Text>
                        <View style={styles.extrasList}>
                            {getFilteredExtras().map(item => (
                                <ExtraItem
                                    key={item.id}
                                    item={item}
                                    count={extras[item.id] || 0}
                                    onUpdate={(delta) => updateExtra(item.id, delta)}
                                    colors={colors}
                                />
                            ))}
                        </View>
                    </>
                ) : (
                    /* Dry Cleaning Logic */
                    <View style={styles.extrasList}>
                        <Text style={[styles.sectionTitle, { marginBottom: 16, color: colors.text }]}>Выберите мебель для чистки</Text>
                        {DRY_CLEANING_ITEMS.map(item => (
                            <ExtraItem
                                key={item.id}
                                item={item}
                                count={dryCleaning[item.id] || 0}
                                onUpdate={(delta) => updateDry(item.id, delta)}
                                forceSuffix={item.unit}
                                colors={colors}
                            />
                        ))}
                        <View style={[styles.includedCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                            <Text style={[styles.includedTitle, { color: colors.primary }]}>Минимальный выезд 100 zł</Text>
                            <Text style={[styles.tagText, { color: colors.primary }]}>Бесплатный выезд по Варшаве</Text>
                        </View>
                    </View>
                )}

                {/* Date & Address Block */}
                <View style={[styles.sectionCard, { marginTop: 24, backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Детали заказа</Text>

                    {/* Address Input */}
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Адрес *</Text>
                    <TextInput
                        ref={addressRef}
                        style={[
                            styles.input, 
                            { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border },
                            addressError && styles.inputError
                        ]}
                        value={address}
                        onChangeText={(text) => {
                            setAddress(text);
                            if (text.trim()) setAddressError(false);
                        }}
                        placeholder="Улица, дом, квартира"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={2}
                    />

                    {/* Phone Input */}
                    <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Телефон *</Text>
                    <TextInput
                        ref={phoneRef}
                        style={[
                            styles.input, 
                            { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border },
                            phoneError && styles.inputError
                        ]}
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text);
                            if (text.trim()) setPhoneError(false);
                        }}
                        placeholder="+48 123 456 789"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                    />

                    {/* Door Code Input */}
                    <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Код домофона</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                        value={doorCode}
                        onChangeText={setDoorCode}
                        placeholder="1234 или ключи у консьержа"
                        placeholderTextColor={colors.textSecondary}
                    />

                    {/* Preferred Contact Time */}
                    <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Когда удобно связаться?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        <View style={styles.contactTimeContainer}>
                            {['Утром (9-12)', 'Днём (12-17)', 'Вечером (17-20)', 'Любое время'].map(time => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.contactTimeChip,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                                        preferredContactTime === time && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setPreferredContactTime(preferredContactTime === time ? '' : time)}
                                >
                                    <Text style={[
                                        styles.contactTimeText,
                                        { color: colors.text },
                                        preferredContactTime === time && { color: '#fff' }
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Comments Input */}
                    <Text style={[styles.label, { marginTop: 8, color: colors.textSecondary }]}>Дополнительные пожелания</Text>
                    <TextInput
                        style={[
                            styles.input, 
                            styles.textArea,
                            { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }
                        ]}
                        value={comments}
                        onChangeText={setComments}
                        placeholder="Особые пожелания, аллергии, домашние животные, ключи от квартиры..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    {/* Date & Time Picker */}
                    <View ref={dateTimeRef}>
                        <DateTimePicker
                            selectedDate={selectedDateTime.date}
                            selectedTime={selectedDateTime.time}
                            onSelect={setSelectedDateTime}
                        />
                    </View>
                </View>


                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.totalContainer}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Итого к оплате</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>{calculateTotal()} zł</Text>
                </View>
                <Button
                    title="Заказать"
                    onPress={handleOrder}
                    loading={loading}
                    style={{ width: 140, marginVertical: 0 }}
                />
            </BlurView>

            <SuccessModal
                visible={showSuccessModal}
                title="Заказ принят!"
                message="Спасибо Вам за заказ. Менеджер свяжется с Вами. Хорошего дня!"
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.navigate('History');
                }}
            />

        </Container>
    );
}

// Reuse Sub-components (unchanged visual parts, logic is same)
function CounterRow({ label, value, onChange, min = 0, max = 10, suffix = '', colors }) {
    return (
        <View style={styles.counterRow}>
            <Text style={[styles.counterLabel, { color: colors.text }]}>{label}</Text>
            <View style={styles.counterControls}>
                <TouchableOpacity
                    onPress={() => onChange(Math.max(min, value - 1))}
                    style={[
                        styles.roundBtn, 
                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                        value <= min && styles.btnDisabled
                    ]}
                    disabled={value <= min}
                >
                    <Ionicons name="remove" size={20} color={value <= min ? colors.textSecondary : colors.primary} />
                </TouchableOpacity>

                <Text style={[styles.counterValue, { color: colors.text }]}>
                    {value} <Text style={[styles.counterSuffix, { color: colors.textSecondary }]}>{suffix}</Text>
                </Text>

                <TouchableOpacity
                    onPress={() => onChange(Math.min(max, value + 1))}
                    style={[
                        styles.roundBtn, 
                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                        value >= max && styles.btnDisabled
                    ]}
                    disabled={value >= max}
                >
                    <Ionicons name="add" size={20} color={value >= max ? colors.textSecondary : colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function ExtraItem({ item, count, onUpdate, forceSuffix, colors }) {
    const isActive = count > 0;
    return (
        <View style={[
            styles.extraItem, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            isActive && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
        ]}>
            <View style={[styles.extraIcon, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name={item.icon} size={24} color={isActive ? colors.primary : colors.textSecondary} />
            </View>
            <View style={styles.extraInfo}>
                <Text style={[
                    styles.extraName, 
                    { color: colors.text },
                    isActive && { color: colors.primary, fontWeight: Typography.bold }
                ]}>{item.name}</Text>
                <Text style={[styles.extraPrice, { color: colors.textSecondary }]}>{item.price} zł{forceSuffix ? `/${forceSuffix}` : ''}</Text>
            </View>

            {isActive ? (
                <View style={[styles.miniCounter, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={() => onUpdate(-1)} style={[styles.miniBtn, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.miniCount, { color: colors.primary }]}>{count}</Text>
                    <TouchableOpacity onPress={() => onUpdate(1)} style={[styles.miniBtn, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => onUpdate(1)} style={[styles.addButton, { backgroundColor: colors.inputBackground }]}>
                    <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 0,
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: Colors.background,
    },
    headerTitle: {
        fontSize: Typography.h2,
        fontWeight: Typography.bold,
        color: Colors.text,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    horizontalTabs: {
        marginBottom: 24,
        overflow: 'visible'
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 12,
        gap: 12,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 1 }
        })
    },
    tabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        ...Platform.select({
            ios: { shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 6 }
        })
    },
    tabText: {
        fontSize: Typography.body,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: {
        fontSize: Typography.body,
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    counterLabel: {
        fontSize: Typography.body,
        color: Colors.text,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roundBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    btnDisabled: {
        opacity: 0.5,
        borderColor: '#f0f0f0',
    },
    counterValue: {
        fontSize: Typography.body,
        fontWeight: Typography.bold,
        minWidth: 80,
        textAlign: 'center',
    },
    counterSuffix: {
        fontWeight: Typography.regular,
        color: Colors.textSecondary,
        fontSize: Typography.small,
    },
    listHeader: {
        fontSize: Typography.h3,
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: 16,
    },
    extrasList: {
        gap: 12,
    },
    extraItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    extraItemActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    extraIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    extraInfo: {
        flex: 1,
    },
    extraName: {
        fontSize: Typography.body,
        fontWeight: Typography.medium,
        color: Colors.text,
    },
    textPrimary: {
        color: Colors.primary,
        fontWeight: Typography.bold,
    },
    extraPrice: {
        fontSize: Typography.small,
        color: Colors.textSecondary,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        gap: 8,
    },
    miniBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniCount: {
        fontWeight: Typography.bold,
        fontSize: Typography.body,
        color: Colors.primary,
        minWidth: 16,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 80, // Lifted above Tab Bar
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#fff', // Solid background for clarity
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: { elevation: 5 },
            web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }
        })
    },
    totalContainer: {
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: Typography.caption,
        color: Colors.textSecondary,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: Typography.extraBold,
        color: Colors.primary,
    },
    includedCard: {
        backgroundColor: Colors.primaryLight,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed'
    },
    includedTitle: {
        fontSize: Typography.small,
        color: Colors.primaryDark,
        marginBottom: 8,
        fontWeight: Typography.bold,
    },
    includedTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: Typography.medium,
    },
    label: {
        fontSize: Typography.caption,
        color: Colors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '600'
    },
    input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 1 }
        })
    },
    textArea: {
        height: 80,
        paddingTop: 16,
    },
    contactTimeContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 20,
    },
    contactTimeChip: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    contactTimeChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    contactTimeText: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
    },
    contactTimeTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    dateChip: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center'
    },
    dateChipActive: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primary
    },
    dateText: {
        fontWeight: 'bold',
        color: Colors.text
    },
    dateSub: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 2
    },
    dateTextActive: {
        color: Colors.primary
    },
    timeChip: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeChipActive: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primary
    },
    timeChipDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#eee',
        opacity: 0.6
    },
    timeText: {
        color: Colors.text,
        fontWeight: 'bold'
    },
    timeTextDisabled: {
        color: '#aaa',
        textDecorationLine: 'line-through'
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 2,
        backgroundColor: '#fef2f2'
    }
});
