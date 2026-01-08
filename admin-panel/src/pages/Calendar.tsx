import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { ChevronLeft, ChevronRight, Add, Delete } from '@mui/icons-material';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const workingHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadTimeSlots = async (date: string) => {
    const docRef = doc(db, 'availableSlots', date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const slots = workingHours.map(time => ({
        time,
        available: data[time] !== true  // true = заблокировано, false/undefined = доступно
      }));
      setTimeSlots(slots);
    } else {
      // По умолчанию все слоты доступны
      const slots = workingHours.map(time => ({ time, available: true }));
      setTimeSlots(slots);
    }
  };

  const toggleSlot = async (time: string) => {
    if (!selectedDate) return;
    
    const docRef = doc(db, 'availableSlots', selectedDate);
    const slot = timeSlots.find(s => s.time === time);
    
    // Клик блокирует/разблокирует: true = заблокировано, false = доступно
    await setDoc(docRef, {
      [time]: slot?.available ? true : false
    }, { merge: true });
    
    loadTimeSlots(selectedDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Календарь доступности
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Клик по времени блокирует его для клиентов. Зеленый = доступно, Красный = заблокировано
        </Typography>
      </Box>

      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={prevMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={nextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Grid container spacing={1}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <Grid item xs={12/7} key={day}>
              <Box sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                p: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '1rem' }
              }}>
                {isMobile ? day.charAt(0) : day}
              </Box>
            </Grid>
          ))}
          
          {days.map((day, index) => (
            <Grid item xs={12/7} key={index}>
              {day ? (
                <Button
                  fullWidth
                  variant={selectedDate === formatDate(day) ? 'contained' : 'outlined'}
                  onClick={() => setSelectedDate(formatDate(day))}
                  sx={{ 
                    minHeight: { xs: 40, sm: 60 },
                    fontSize: { xs: '0.75rem', sm: '1rem' },
                    p: { xs: 0.5, sm: 1 },
                    opacity: formatDate(day) < formatDate(new Date()) ? 0.5 : 1
                  }}
                  disabled={formatDate(day) < formatDate(new Date())}
                >
                  {day.getDate()}
                </Button>
              ) : (
                <Box sx={{ minHeight: { xs: 40, sm: 60 } }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {selectedDate && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
            Временные слоты для {selectedDate}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Нажмите на время, чтобы заблокировать/разблокировать
          </Typography>
          
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {timeSlots.map(slot => (
              <Grid item xs={4} sm={3} md={2} key={slot.time}>
                <Chip
                  label={slot.time}
                  color={slot.available ? 'success' : 'error'}
                  onClick={() => toggleSlot(slot.time)}
                  sx={{ 
                    width: '100%', 
                    height: { xs: 36, sm: 40 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
