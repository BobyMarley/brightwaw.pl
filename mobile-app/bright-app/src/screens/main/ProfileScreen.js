import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Typography from '../../theme/Typography';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../context/ThemeContext';

const MenuItem = ({ icon, title, onPress, useThemeColors }) => {
    const { colors, isDark } = useThemeColors;
    return (
        <TouchableOpacity onPress={onPress} style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );
};

const ThemeMenuItem = ({ useThemeColors }) => {
    const { colors, isDark } = useThemeColors;
    const { theme, toggleTheme } = useTheme();
    
    const getThemeText = () => {
        switch(theme) {
            case 'light': return 'Светлая тема';
            case 'dark': return 'Тёмная тема';
            case 'system': return 'Как в системе';
            default: return 'Тема';
        }
    };
    
    const getThemeIcon = () => {
        switch(theme) {
            case 'light': return 'sunny';
            case 'dark': return 'moon';
            case 'system': return 'phone-portrait';
            default: return 'color-palette';
        }
    };
    
    return (
        <TouchableOpacity onPress={toggleTheme} style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={getThemeIcon()} size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>{getThemeText()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );
};

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState('');
    const [socials, setSocials] = useState({ instagram: '', facebook: '' });
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);

    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        const loadUserData = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.displayName) setName(data.displayName);
                    if (data.phoneNumber) setPhone(data.phoneNumber);
                    if (data.socials) setSocials(data.socials);
                    if (data.photoURL) setAvatarUrl(data.photoURL);
                }
            } catch (e) {
                console.error("Error loading user data:", e);
            }
        };
        loadUserData();
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            setAvatarUrl(downloadURL);
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
            await setDoc(doc(db, "users", user.uid), { photoURL: downloadURL }, { merge: true });
        } catch (e) {
            Alert.alert("Ошибка", "Не удалось загрузить фото");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name, photoURL: avatarUrl });
            }
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                displayName: name,
                phoneNumber: phone,
                email: user.email,
                socials: socials,
                photoURL: avatarUrl,
                updatedAt: new Date()
            }, { merge: true });
            setIsEditing(false);
            Alert.alert("Успешно", "Профиль обновлен");
        } catch (e) {
            Alert.alert("Ошибка", "Не удалось сохранить");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            Alert.alert("Письмо отправлено", `На ${user.email}`);
        } catch (e) {
            Alert.alert("Ошибка", e.message);
        }
    };

    const addAddress = () => {
        if (!newAddress) return;
        setAddresses([...addresses, newAddress]);
        setNewAddress('');
        setShowAddressModal(false);
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            {/* Full Screen Background Color Layer */}
            <View style={[styles.backgroundColorLayer, { backgroundColor: colors.primary }]} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header Title */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Профиль</Text>
                </View>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        {uploading ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={[styles.avatarPlaceholderText, { color: colors.primary }]}>
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={pickImage}>
                            <Ionicons name="camera" size={14} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{name || 'Пользователь'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Menu Items List */}
                <View style={styles.menuContainer}>
                    {isEditing ? (
                        <View style={[styles.editFormCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Редактирование</Text>
                            <Input
                                value={name}
                                onChangeText={setName}
                                placeholder="Ваше имя"
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <Input
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Телефон"
                                icon="call-outline"
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <Input
                                value={socials.instagram}
                                onChangeText={t => setSocials({ ...socials, instagram: t })}
                                placeholder="Instagram"
                                icon="logo-instagram"
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <Input
                                value={socials.facebook}
                                onChangeText={t => setSocials({ ...socials, facebook: t })}
                                placeholder="Facebook"
                                icon="logo-facebook"
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <View style={styles.editButtons}>
                                <Button
                                    title="Сохранить"
                                    onPress={handleSave}
                                    loading={loading}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    title="Отмена"
                                    variant="outline"
                                    onPress={() => setIsEditing(false)}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    ) : (
                        <>
                            <MenuItem title="Редактировать профиль" onPress={() => setIsEditing(true)} useThemeColors={{ colors, isDark }} />
                            <MenuItem title="Мои адреса" onPress={() => setShowAddressModal(true)} useThemeColors={{ colors, isDark }} />
                            <ThemeMenuItem useThemeColors={{ colors, isDark }} />
                            <MenuItem title="Сменить пароль" onPress={handlePasswordReset} useThemeColors={{ colors, isDark }} />
                            <MenuItem title="Уведомления" onPress={() => { }} useThemeColors={{ colors, isDark }} />
                            <MenuItem title="Выйти" onPress={logout} useThemeColors={{ colors, isDark }} />
                        </>
                    )}
                </View>

                {/* Address Modal */}
                <Modal visible={showAddressModal} animationType="fade" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Адреса</Text>
                            <ScrollView style={{ maxHeight: 200, width: '100%', marginBottom: 16 }}>
                                {addresses.length === 0 ? (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Ionicons name="location-outline" size={40} color={colors.textLight} />
                                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 10 }}>
                                            Нет сохраненных адресов
                                        </Text>
                                    </View>
                                ) : (
                                    addresses.map((addr, i) => (
                                        <View key={i} style={[styles.addressRow, { borderBottomColor: colors.border }]}>
                                            <Ionicons name="location" size={20} color={colors.primary} />
                                            <Text style={[styles.addressText, { color: colors.text }]}>{addr}</Text>
                                        </View>
                                    ))
                                )}
                            </ScrollView>
                            <Input
                                placeholder="Введите новый адрес"
                                value={newAddress}
                                onChangeText={setNewAddress}
                                style={{ width: '100%', backgroundColor: colors.inputBackground, color: colors.text }}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <View style={styles.modalActions}>
                                <Button title="Добавить" onPress={addAddress} style={{ flex: 1 }} />
                                <Button
                                    title="Закрыть"
                                    variant="outline"
                                    onPress={() => setShowAddressModal(false)}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    backgroundColorLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    content: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        opacity: 0.9
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },

    // MENU ITEMS
    menuContainer: {
        gap: 12,
    },
    menuItem: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 }
        })
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '600',
    },

    // EDIT FORM CARD
    editFormCard: {
        borderRadius: 20,
        padding: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 }
        }),
        gap: 12
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center'
    },
    input: {
        borderWidth: 0,
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },

    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    addressText: {
        marginLeft: 12,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16
    }
});
