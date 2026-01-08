import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ChatMessenger from '../components/ChatMessenger';

export default function Chat() {
    const { user, userRole } = useAuth();
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            // Работникам не нужен список всех работников
            if (userRole === 'worker') {
                setWorkers([]);
                setLoading(false);
                return;
            }
            
            const q = query(collection(db, 'workers'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const workersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWorkers(workersData);
        } catch (error) {
            console.error('Error loading workers:', error);
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    💬 Мессенджер
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {userRole === 'admin' ? 'Общайтесь с работниками' : 'Общайтесь с командой'}
                </Typography>
            </Box>

            <ChatMessenger workers={workers} isAdmin={userRole === 'admin'} />
        </Container>
    );
}
