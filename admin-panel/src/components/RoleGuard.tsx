import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
    allowedRoles: ('admin' | 'worker')[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return fallback || (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Paper sx={{ p: 4, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <Typography variant="h5" sx={{ color: '#dc2626', mb: 2 }}>
                        Доступ запрещен
                    </Typography>
                    <Typography color="text.secondary">
                        У вас нет прав для просмотра этой страницы
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return <>{children}</>;
}