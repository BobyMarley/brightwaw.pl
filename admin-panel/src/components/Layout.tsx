import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    ShoppingCart as OrdersIcon,
    People as PeopleIcon,
    Logout as LogoutIcon,
    CalendarMonth as CalendarIcon,
    Menu as MenuIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 240;

export default function Layout() {
    const { logout, user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const getMenuItems = () => {
        const { userRole } = useAuth();
        
        if (userRole === 'worker') {
            return [
                { text: 'Мой кабинет', icon: <DashboardIcon />, path: '/' },
                { text: 'Расписание', icon: <CalendarIcon />, path: '/schedule' },
                { text: 'Сообщения', icon: <ChatIcon />, path: '/chat' },
            ];
        }
        
        return [
            { text: 'Обзор', icon: <DashboardIcon />, path: '/' },
            { text: 'Заказы', icon: <OrdersIcon />, path: '/orders' },
            { text: 'Работники', icon: <PeopleIcon />, path: '/workers' },
            { text: 'Календарь', icon: <CalendarIcon />, path: '/calendar' },
            { text: 'График работников', icon: <CalendarIcon />, path: '/workers-schedule' },
            { text: 'Сообщения', icon: <ChatIcon />, path: '/chat' },
        ];
    };
    
    const menuItems = getMenuItems();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box>
            {!isMobile && <Toolbar />}
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {isMobile && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={toggleDarkMode}>
                                <ListItemIcon>{darkMode ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
                                <ListItemText primary={darkMode ? 'Светлая тема' : 'Темная тема'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={logout}>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Выход" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div" 
                        sx={{ 
                            flexGrow: 1, 
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            fontWeight: 600
                        }}
                    >
                        {isMobile ? 'BrightHouse' : 'BrightHouse Control Panel'}
                    </Typography>
                    {!isMobile && (
                        <>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {user?.email}
                            </Typography>
                            <IconButton color="inherit" onClick={toggleDarkMode}>
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                            <IconButton color="inherit" onClick={logout}>
                                <LogoutIcon />
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    {drawer}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    ml: { xs: 0, md: `${drawerWidth}px` },
                    pb: { xs: 8, md: 0 }
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>

            {isMobile && (
                <BottomNavigation
                    value={location.pathname}
                    onChange={(event, newValue) => navigate(newValue)}
                    showLabels
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        borderTop: '1px solid #e0e0e0'
                    }}
                >
                    {menuItems.map((item) => (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.text}
                            value={item.path}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            )}
        </Box>
    );
}
