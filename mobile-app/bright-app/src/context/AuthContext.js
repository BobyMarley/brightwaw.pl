import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                // User is signed in
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    name: authUser.displayName,
                    displayName: authUser.displayName, // Добавляем для совместимости
                    photoURL: authUser.photoURL,
                });
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            
            // Отправка письма для подтверждения email
            const { sendEmailVerification } = await import('firebase/auth');
            await sendEmailVerification(userCredential.user);
            
            setUser({
                ...user,
                name: name
            });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        signOut(auth).finally(() => setLoading(false));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
