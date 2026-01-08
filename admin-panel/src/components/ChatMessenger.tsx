import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, TextField, IconButton, Avatar, Typography, Stack, Divider, Badge, Tabs, Tab,
    List, ListItem, ListItemAvatar, ListItemText, InputAdornment, Menu, MenuItem
} from '@mui/material';
import {
    Send as SendIcon, AttachFile as AttachIcon, EmojiEmotions as EmojiIcon,
    Close as CloseIcon, Image as ImageIcon
} from '@mui/icons-material';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Chat {
    id: string;
    participants: string[];
    participantNames: { [key: string]: string };
    lastMessage?: string;
    lastMessageTime?: any;
    unreadCount?: { [key: string]: number };
    type: 'direct' | 'group';
    name?: string;
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    imageUrl?: string;
    createdAt: any;
}

const EMOJIS = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '✅', '💪', '🙏'];

export default function ChatMessenger({ workers, isAdmin }: { workers: any[], isAdmin: boolean }) {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        loadChats();
    }, [user]);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat);
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChats = async () => {
        const chatsRef = collection(db, 'chats');
        
        onSnapshot(chatsRef, (snapshot) => {
            const allChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Chat[];
            
            console.log('Current user UID:', user.uid);
            console.log('All chats:', allChats);
            
            // Фильтруем чаты на клиенте
            const chatsData = allChats.filter(chat => {
                const isParticipant = chat.participants && chat.participants.includes(user.uid);
                console.log(`Chat ${chat.id} participants:`, chat.participants, 'includes user:', isParticipant);
                return isParticipant;
            });
            
            console.log('Filtered chats for user:', chatsData);
            setChats(chatsData);
            
            // Автоматически выбираем первый чат
            if (!selectedChat && chatsData.length > 0) {
                setSelectedChat(chatsData[0].id);
            }
        });
    };

    const loadMessages = (chatId: string) => {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        
        onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(messagesData);
        });
    };

    const createOrGetChat = async (workerId: string, workerName: string) => {
        const participants = [user.uid, workerId].sort();
        const existingChat = chats.find(c => 
            c.type === 'direct' && 
            c.participants.length === 2 &&
            c.participants.includes(user.uid) && 
            c.participants.includes(workerId)
        );

        if (existingChat) {
            setSelectedChat(existingChat.id);
            return existingChat.id;
        }

        const chatData = {
            participants,
            participantNames: {
                [user.uid]: user.displayName || user.email,
                [workerId]: workerName
            },
            type: 'direct',
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        setSelectedChat(chatRef.id);
        return chatRef.id;
    };

    const createGroupChat = async () => {
        // Проверяем существующий общий чат
        const existingGroup = chats.find(c => c.type === 'group' && c.name === 'Общий чат');
        if (existingGroup) {
            setSelectedChat(existingGroup.id);
            return;
        }

        console.log('Creating group chat with admin UID:', user.uid);
        console.log('Workers:', workers);
        
        const allParticipants = [user.uid, ...workers.map(w => w.uid || w.id)];
        console.log('All participants UIDs:', allParticipants);
        
        const participantNames: any = { [user.uid]: 'Админ' };
        workers.forEach(w => participantNames[w.uid || w.id] = w.name);

        const chatData = {
            participants: allParticipants,
            participantNames,
            type: 'group',
            name: 'Общий чат',
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        setSelectedChat(chatRef.id);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            senderId: user.uid,
            senderName: user.displayName || user.email,
            text: newMessage.trim(),
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'chats', selectedChat, 'messages'), messageData);
        await updateDoc(doc(db, 'chats', selectedChat), {
            lastMessage: newMessage.trim(),
            lastMessageTime: serverTimestamp()
        });

        setNewMessage('');
    };

    const uploadImage = async (file: File) => {
        if (!selectedChat) return;

        const storageRef = ref(storage, `chat-images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        const messageData = {
            senderId: user.uid,
            senderName: user.displayName || user.email,
            text: '📷 Фото',
            imageUrl,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'chats', selectedChat, 'messages'), messageData);
        await updateDoc(doc(db, 'chats', selectedChat), {
            lastMessage: '📷 Фото',
            lastMessageTime: serverTimestamp()
        });
    };

    const selectedChatData = chats.find(c => c.id === selectedChat);
    const otherParticipantName = selectedChatData?.type === 'group' 
        ? 'Общий чат' 
        : selectedChatData?.participantNames[selectedChatData.participants.find(p => p !== user.uid) || ''];

    return (
        <Box sx={{ display: 'flex', height: '600px', border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: (theme) => theme.palette.background.paper }}>
            {/* Sidebar */}
            <Box sx={{ width: 280, borderRight: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', bgcolor: (theme) => theme.palette.background.paper }}>
                <Box sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary }}>Сообщения</Typography>
                </Box>
                
                <Box sx={{ p: 1 }}>
                    {isAdmin && (
                        <>
                            <MenuItem onClick={createGroupChat} sx={{ borderRadius: 1, mb: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e3a5f' : '#e3f2fd' }}>
                                <Avatar sx={{ mr: 2, bgcolor: '#3b82f6' }}>👥</Avatar>
                                <Typography sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary }}>Общий чат</Typography>
                            </MenuItem>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', display: 'block', mb: 1 }}>Работники:</Typography>
                        </>
                    )}
                    {!isAdmin && chats.length === 0 && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Загрузка чатов...
                            </Typography>
                        </Box>
                    )}
                </Box>

                <List sx={{ flex: 1, overflow: 'auto' }}>
                    {isAdmin ? (
                        workers.length > 0 ? workers.map(worker => {
                            const workerChat = chats.find(c => 
                                c.type === 'direct' && c.participants.includes(worker.id)
                            );
                            return (
                                <ListItem 
                                    key={worker.id} 
                                    button 
                                    onClick={() => createOrGetChat(worker.id, worker.name)}
                                    selected={selectedChat === workerChat?.id}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={worker.photo}>{worker.name[0]}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={worker.name}
                                        secondary={workerChat?.lastMessage || 'Начать чат'}
                                    />
                                </ListItem>
                            );
                        }) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Нет работников
                                </Typography>
                            </Box>
                        )
                    ) : (
                        chats.length > 0 ? chats.map(chat => (
                            <ListItem 
                                key={chat.id} 
                                button 
                                onClick={() => setSelectedChat(chat.id)}
                                selected={selectedChat === chat.id}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: chat.type === 'group' ? '#3b82f6' : '#10b981' }}>
                                        {chat.type === 'group' ? '👥' : 'A'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={chat.type === 'group' ? 'Общий чат' : 'Админ'} 
                                    secondary={chat.lastMessage || 'Нет сообщений'}
                                />
                            </ListItem>
                        )) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Чатов пока нет
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Админ создаст общий чат
                                </Typography>
                            </Box>
                        )
                    )}
                </List>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                    <>
                        <Box sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', bgcolor: (theme) => theme.palette.background.paper }}>
                            <Avatar sx={{ mr: 2 }}>{selectedChatData?.type === 'group' ? '👥' : otherParticipantName?.[0]}</Avatar>
                            <Typography variant="h6" sx={{ color: (theme) => theme.palette.text.primary }}>{otherParticipantName}</Typography>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#ffffff' }}>
                            {messages.map(msg => (
                                <Box 
                                    key={msg.id} 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: msg.senderId === user.uid ? 'flex-end' : 'flex-start',
                                        mb: 2
                                    }}
                                >
                                    <Box sx={{ maxWidth: '70%' }}>
                                        {msg.senderId !== user.uid && (
                                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                {msg.senderName}
                                            </Typography>
                                        )}
                                        <Paper 
                                            sx={{ 
                                                p: 1.5, 
                                                bgcolor: msg.senderId === user.uid ? '#3b82f6' : (theme) => theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9',
                                                color: msg.senderId === user.uid ? 'white' : (theme) => theme.palette.text.primary
                                            }}
                                        >
                                            {msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                                            )}
                                            <Typography variant="body2">{msg.text}</Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>

                        <Box sx={{ p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: (theme) => theme.palette.background.paper }}>
                            <TextField
                                fullWidth
                                placeholder="Написать сообщение..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)}>
                                                <EmojiIcon />
                                            </IconButton>
                                            <IconButton onClick={() => fileInputRef.current?.click()}>
                                                <ImageIcon />
                                            </IconButton>
                                            <IconButton onClick={sendMessage} color="primary">
                                                <SendIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                            />
                        </Box>

                        <Menu
                            anchorEl={emojiAnchor}
                            open={Boolean(emojiAnchor)}
                            onClose={() => setEmojiAnchor(null)}
                        >
                            {EMOJIS.map(emoji => (
                                <MenuItem 
                                    key={emoji} 
                                    onClick={() => {
                                        setNewMessage(newMessage + emoji);
                                        setEmojiAnchor(null);
                                    }}
                                >
                                    {emoji}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: (theme) => theme.palette.text.secondary }}>
                                💬 Выберите чат
                            </Typography>
                            {isAdmin && (
                                <Typography variant="body2" color="text.secondary">
                                    Нажмите "Общий чат" или выберите работника слева
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
