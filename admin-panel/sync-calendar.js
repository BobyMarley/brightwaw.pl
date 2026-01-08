// Скрипт для синхронизации Google Calendar с Firestore
// Запуск: node sync-calendar.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase config (тот же, что в firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBC5Fx11DwQU3zo_Rol_x5USKC_Z7fScJA",
  authDomain: "praniebrightwaw.firebaseapp.com",
  projectId: "praniebrightwaw",
  storageBucket: "praniebrightwaw.firebasestorage.app",
  messagingSenderId: "199792015841",
  appId: "1:199792015841:web:2e4b549e1bbf10771f3aa0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google Calendar API (требует установки: npm install googleapis)
// const { google } = require('googleapis');

async function syncCalendar() {
  console.log('🔄 Начало синхронизации календаря...');
  
  try {
    // TODO: Настроить Google Calendar API
    // 1. Создать Service Account в Google Cloud Console
    // 2. Скачать JSON ключ
    // 3. Дать доступ к календарю
    
    // Пример: Получить события из Google Calendar
    /*
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = 'YOUR_CALENDAR_ID@group.calendar.google.com';
    
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items;
    console.log(`📅 Найдено событий: ${events.length}`);
    
    // Обработать события
    const dateSlots = {};
    
    events.forEach(event => {
      if (event.start.dateTime) {
        const startTime = new Date(event.start.dateTime);
        const date = startTime.toISOString().split('T')[0];
        const time = startTime.toTimeString().slice(0, 5);
        
        if (!dateSlots[date]) {
          dateSlots[date] = {};
        }
        dateSlots[date][time] = false; // Занято
      }
    });
    
    // Обновить Firestore
    for (const [date, slots] of Object.entries(dateSlots)) {
      const docRef = doc(db, 'availableSlots', date);
      await setDoc(docRef, slots, { merge: true });
      console.log(`✅ Обновлена дата: ${date}`);
    }
    
    console.log('✨ Синхронизация завершена успешно!');
    */
    
    // ВРЕМЕННОЕ РЕШЕНИЕ: Создать тестовые данные
    console.log('⚠️  Google Calendar API не настроен');
    console.log('📝 Создание тестовых данных...');
    
    const today = new Date();
    const workingHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    
    // Создать слоты на следующие 14 дней
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const slots = {};
      workingHours.forEach(time => {
        // Случайно блокируем некоторые слоты для демонстрации
        slots[time] = Math.random() > 0.3; // 70% доступны
      });
      
      const docRef = doc(db, 'availableSlots', dateStr);
      await setDoc(docRef, slots);
      console.log(`✅ Создана дата: ${dateStr}`);
    }
    
    console.log('✨ Тестовые данные созданы!');
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error);
  }
  
  process.exit(0);
}

// Запустить синхронизацию
syncCalendar();
