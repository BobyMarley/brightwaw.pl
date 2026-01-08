import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Calendar from './pages/Calendar';
import Workers from './pages/Workers';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerSchedulePage from './pages/WorkerSchedulePage';
import WorkersScheduleSimple from './pages/WorkersScheduleSimple';
import Chat from './pages/Chat';
import WorkerRegister from './pages/WorkerRegister';
import RoleGuard from './components/RoleGuard';
import { Typography } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Placeholders
const Dashboard = () => {
    const { userRole } = useAuth();
    
    if (userRole === 'worker') {
        return <WorkerDashboard />;
    }
    
    return <Typography variant="h4">Добро пожаловать в админку</Typography>;
};

function App() {
    return (
        <CustomThemeProvider>
            <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/worker-register" element={<WorkerRegister />} />

                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={
                        <RoleGuard allowedRoles={['admin']}>
                            <Orders />
                        </RoleGuard>
                    } />
                    <Route path="/workers" element={
                        <RoleGuard allowedRoles={['admin']}>
                            <Workers />
                        </RoleGuard>
                    } />
                    <Route path="/calendar" element={
                        <RoleGuard allowedRoles={['admin']}>
                            <Calendar />
                        </RoleGuard>
                    } />
                    <Route path="/schedule" element={
                        <RoleGuard allowedRoles={['worker']}>
                            <WorkerSchedulePage />
                        </RoleGuard>
                    } />
                    <Route path="/workers-schedule" element={
                        <RoleGuard allowedRoles={['admin']}>
                            <WorkersScheduleSimple />
                        </RoleGuard>
                    } />
                    <Route path="/chat" element={<Chat />} />
                </Route>
            </Routes>
            </AuthProvider>
        </CustomThemeProvider>
    );
}

export default App;
