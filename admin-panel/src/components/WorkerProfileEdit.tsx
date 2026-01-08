import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    Box, Avatar, IconButton, Typography, Stack
} from '@mui/material';
import { PhotoCamera as PhotoIcon } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface WorkerProfileEditProps {
    worker: any;
    open: boolean;
    onClose: () => void;
    onSave: (updatedWorker: any) => void;
}

export default function WorkerProfileEdit({ worker, open, onClose, onSave }: WorkerProfileEditProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: worker?.name || '',
        phone: worker?.phone || '',
        telegram: worker?.telegram || '',
        whatsapp: worker?.whatsapp || '',
        photo: worker?.photo || ''
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            const photoRef = ref(storage, `worker-photos/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(photoRef, file);
            const photoURL = await getDownloadURL(photoRef);
            
            setFormData(prev => ({ ...prev, photo: photoURL }));
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Ошибка загрузки фото');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!worker?.id) return;

        setSaving(true);
        try {
            const updatedData = {
                ...formData,
                updatedAt: new Date()
            };

            await updateDoc(doc(db, 'workers', worker.id), updatedData);
            
            onSave({ ...worker, ...updatedData });
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ошибка сохранения профиля');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogContent sx={{ pt: '24px !important' }}>
                <Stack spacing={3}>
                    {/* Photo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            src={formData.photo} 
                            sx={{ width: 80, height: 80 }}
                        >
                            {formData.name[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="photo-upload"
                                type="file"
                                onChange={handlePhotoUpload}
                            />
                            <label htmlFor="photo-upload">
                                <IconButton 
                                    color="primary" 
                                    component="span"
                                    disabled={uploading}
                                >
                                    <PhotoIcon />
                                </IconButton>
                            </label>
                            <Typography variant="caption" display="block">
                                {uploading ? 'Загрузка...' : 'Изменить фото'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Name */}
                    <TextField
                        fullWidth
                        label="Имя и фамилия"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />

                    {/* Phone */}
                    <TextField
                        fullWidth
                        label="Телефон"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />

                    {/* Telegram */}
                    <TextField
                        fullWidth
                        label="Telegram"
                        value={formData.telegram}
                        onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                        placeholder="@username"
                    />

                    {/* WhatsApp */}
                    <TextField
                        fullWidth
                        label="WhatsApp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="+48 123 456 789"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    disabled={saving || uploading}
                >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}