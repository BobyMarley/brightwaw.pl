import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    userRole: 'admin' | 'worker' | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, userRole: null, loading: true, logout: () => { } });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'worker' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            
            if (user) {
                const role = getUserRole(user);
                setUserRole(role);
            } else {
                setUserRole(null);
            }
            
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const getUserRole = (user: User): 'admin' | 'worker' | null => {
        console.log('Checking role for user:', user.uid, user.email);
        
        // Простая проверка по email - если не админ, то работник
        const isAdminEmail = user.email?.includes('plenkanet') || user.email === 'maptonavigation@gmail.com';
        
        if (isAdminEmail) {
            console.log('User is an admin');
            return 'admin';
        } else {
            console.log('User is a worker');
            return 'worker';
        }
    };

    const logout = () => {
        signOut(auth);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, userRole, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
