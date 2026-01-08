import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Typography from '../../theme/Typography';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// Изображение клинера из локальных assets
const CleanerImage = require('../../../assets/cleaner.png');

// Карточка услуги с цветным фоном и иконкой
const ServiceCard = ({ title, subtitle, icon, colorLight, colorDark, iconColor, onPress, useThemeColors }) => {
    const { colors, isDark } = useThemeColors; // Получаем тему

    // Определяем цвет фона карточки
    const backgroundColor = isDark ? colors.surface : colorLight;

    // Цвет текста с правильным контрастом
    const titleColor = colors.text;
    const subtitleColor = colors.textSecondary;

    return (
        <TouchableOpacity style={[styles.serviceCard, { backgroundColor: backgroundColor }]} onPress={onPress}>
            <View style={[styles.serviceIconContainer, { backgroundColor: isDark ? colors.surfaceVariant : 'rgba(255,255,255,0.6)' }]}>
                <Ionicons name={icon} size={28} color={iconColor} />
            </View>
            <View>
                <Text style={[styles.serviceTitle, { color: titleColor }]}>{title}</Text>
                <Text style={[styles.serviceSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
            </View>
            {/* Декоративный круг на фоне */}
            <View style={[styles.decorativeCircle, { backgroundColor: iconColor, opacity: 0.05 }]} />
        </TouchableOpacity>
    );
};

// Элемент списка преимуществ
const FeatureItem = ({ icon, title, desc, useThemeColors }) => {
    const { colors, isDark } = useThemeColors;

    return (
        <View style={[styles.featureItem, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.featureIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{desc}</Text>
            </View>
        </View>
    );
};

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    // Получаем имя пользователя
    const getUserName = () => {
        if (user?.displayName) return user.displayName;
        if (user?.email) {
            // Берём часть email до @ и форматируем как имя
            const emailName = user.email.split('@')[0];
            // Удаляем точки/подчёркивания, берём первое слово, делаем заглавную букву
            const firstName = emailName.split(/[._-]/)[0];
            return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        }
        return 'Гость';
    };
    const displayUser = getUserName();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Верхний синий фон */}
            <View style={[styles.topBackground, { backgroundColor: colors.primary }]} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Хедер */}
                <View style={styles.header}>
                    <Text style={styles.headerSubtitle}>Главная</Text>
                    <View style={styles.notificationBadge}>
                        <Ionicons name="notifications" size={20} color="#fff" />
                    </View>
                </View>

                {/* Баннер с акцией */}
                <View style={[styles.heroBanner, { backgroundColor: colors.surface }]}>
                    <View style={styles.heroContent}>
                        <Text style={[styles.heroGreeting, { color: colors.textSecondary }]}>Добрый день,</Text>
                        <Text style={[styles.heroName, { color: colors.text }]}>{displayUser.split(' ')[0]}</Text>
                        <Text style={[styles.heroLastName, { color: colors.text }]}>{displayUser.split(' ')[1] || ''}</Text>

                        <View style={[styles.promoTag, { backgroundColor: isDark ? colors.surfaceVariant : '#FFF3E0' }]}>
                            <Text style={[styles.promoText, { color: isDark ? colors.warning : '#E65100' }]}>Скидка 15% на первый заказ</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.bookButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('Calculator', { type: 'standard' })}
                        >
                            <Text style={[styles.bookButtonText, { color: colors.textInverse }]}>Заказать уборку</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
                        </TouchableOpacity>
                    </View>

                    {/* Картинка клинера - из локальных assets */}
                    <Image
                        source={CleanerImage}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Секция Услуг */}
                <View style={[styles.servicesSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Наши услуги</Text>
                    <View style={styles.servicesGrid}>
                        <ServiceCard
                            title="Стандартная уборка"
                            subtitle="Поддержка чистоты"
                            icon="sparkles-outline"
                            colorLight="#E3F2FD"
                            iconColor={colors.info}
                            onPress={() => navigation.navigate('Calculator', { type: 'standard' })}
                            useThemeColors={{ colors, isDark }}
                        />
                        <ServiceCard
                            title="Генеральная уборка"
                            subtitle="Глубокая очистка"
                            icon="diamond-outline"
                            colorLight="#F3E5F5"
                            iconColor="#8B5CF6"
                            onPress={() => navigation.navigate('Calculator', { type: 'general' })}
                            useThemeColors={{ colors, isDark }}
                        />
                        <ServiceCard
                            title="После ремонта"
                            subtitle="Уберем всю пыль"
                            icon="construct-outline"
                            colorLight="#FFF3E0"
                            iconColor={colors.warning}
                            onPress={() => navigation.navigate('Calculator', { type: 'renovation' })}
                            useThemeColors={{ colors, isDark }}
                        />
                        <ServiceCard
                            title="Химчистка"
                            subtitle="Мебель и ковры"
                            icon="shirt-outline"
                            colorLight="#E8F5E9"
                            iconColor={colors.success}
                            onPress={() => navigation.navigate('Calculator', { type: 'dry' })}
                            useThemeColors={{ colors, isDark }}
                        />
                    </View>
                </View>

                {/* Секция "Почему мы" */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Почему выбирают нас?</Text>
                    <View style={styles.featuresList}>
                        <FeatureItem icon="shield-checkmark" title="Безопасно" desc="Страховка и проверенные клинеры" useThemeColors={{ colors, isDark }} />
                        <FeatureItem icon="time" title="Пунктуально" desc="Приезжаем всегда вовремя" useThemeColors={{ colors, isDark }} />
                        <FeatureItem icon="leaf" title="Экологично" desc="Безопасные средства для дома" useThemeColors={{ colors, isDark }} />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4
    },
    headerSubtitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    notificationBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Баннер
    heroBanner: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 24,
        height: 190,
        marginBottom: 32,
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible',  // ВИДИМЫЙ - голова выходит за карточку
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16 },
            android: { elevation: 6 }
        })
    },
    heroContent: {
        flex: 1,
        zIndex: 2,
        paddingRight: 10
    },
    heroGreeting: {
        fontSize: 16,
        marginBottom: 4,
    },
    heroName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    promoTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16
    },
    promoText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    bookButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    heroImage: {
        width: 184,      // +15% от 160
        height: 300,     // +15% от 260
        position: 'absolute',
        right: 20,       // Левее, чтобы не попадать на иконку
        bottom: -30,     // Голова выходит на синий фон
    },
    // Секция услуг с собственным фоном
    servicesSection: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
        marginTop: -10,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    // Разделы
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4
    },
    // Сетка услуг
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceCard: {
        width: '48%',
        borderRadius: 24,
        padding: 16,
        height: 150,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 3 }
        })
    },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 2
    },
    serviceSubtitle: {
        fontSize: 11,
    },
    decorativeCircle: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    // Список преимуществ
    featuresList: {
        gap: 12
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    featureIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2
    },
    featureDesc: {
        fontSize: 13,
    }
});
