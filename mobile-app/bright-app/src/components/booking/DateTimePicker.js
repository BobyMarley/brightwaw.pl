import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const DateTimePicker = ({ onSelect, selectedDate, selectedTime }) => {
  const [dates, setDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(selectedDate);

  useEffect(() => {
    generateDates();
    generateTimeSlots();
  }, []);

  const generateDates = () => {
    const today = new Date();
    const nextDays = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Используем локальную дату в формате YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      nextDays.push({
        date: dateStr,
        display: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        dayName: date.toLocaleDateString('ru-RU', { weekday: 'short' })
      });
    }
    
    setDates(nextDays);
    if (!currentDate && nextDays.length > 0) {
      setCurrentDate(nextDays[0].date);
      onSelect({ date: nextDays[0].date, time: null });
    }
  };

  const generateTimeSlots = () => {
    const workingHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const slots = workingHours.map(time => ({ time, available: true }));
    setTimeSlots(slots);
  };

  const handleDateSelect = (date) => {
    setCurrentDate(date);
    onSelect({ date, time: null });
  };

  const handleTimeSelect = (time) => {
    onSelect({ date: currentDate, time });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите дату</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.dateScroll}
        contentContainerStyle={styles.dateScrollContent}
      >
        {dates.map((item) => (
          <TouchableOpacity
            key={item.date}
            style={[
              styles.dateCard,
              currentDate === item.date && styles.dateCardSelected
            ]}
            onPress={() => handleDateSelect(item.date)}
          >
            <Text style={[
              styles.dayName,
              currentDate === item.date && styles.textSelected
            ]}>
              {item.dayName}
            </Text>
            <Text style={[
              styles.dateText,
              currentDate === item.date && styles.textSelected
            ]}>
              {item.display}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Выберите время</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.timeScrollContent}
      >
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.time}
            style={[
              styles.timeSlot,
              selectedTime === slot.time && styles.timeSlotSelected
            ]}
            onPress={() => handleTimeSelect(slot.time)}
          >
            <Text style={[
              styles.timeText,
              selectedTime === slot.time && styles.textSelected
            ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  dateScroll: {
    marginBottom: 24,
    maxHeight: 100,
  },
  dateScrollContent: {
    paddingRight: 20,
  },
  dateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: '#0f85c9',
    borderColor: '#0f85c9',
  },
  dayName: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  textSelected: {
    color: '#fff',
  },
  timeScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    backgroundColor: '#0f85c9',
    borderColor: '#0f85c9',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },

});

export default DateTimePicker;
