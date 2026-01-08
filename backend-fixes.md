# 🔧 Исправления бэкенда для устранения FIRESTORE INTERNAL ASSERTION FAILED

## 1. 🚨 Критические изменения в коде

### Добавить обработку транзакций
```javascript
// В calendarService.js или аналогичном файле
export const updateOrderSafely = async (orderId, updates) => {
  const db = getFirestore();
  
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      // Проверяем права доступа перед обновлением
      const currentData = orderDoc.data();
      const user = auth.currentUser;
      
      if (!canUpdateOrder(user, currentData, updates)) {
        throw new Error('Access denied');
      }
      
      transaction.update(orderRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

### Добавить debounce для частых обновлений
```javascript
// Для предотвращения race conditions
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (docRef, data) => {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Debounced update failed:', error);
  }
}, 300);
```

## 2. 🛡️ Проверки на клиенте

### Валидация перед отправкой
```javascript
const validateOrderUpdate = (orderData, updates) => {
  const allowedFields = [
    'assignedWorkerId', 
    'assignedWorkerName', 
    'workerStatus', 
    'status', 
    'updatedAt', 
    'assignmentHistory'
  ];
  
  const updateKeys = Object.keys(updates);
  const hasInvalidFields = updateKeys.some(key => !allowedFields.includes(key));
  
  if (hasInvalidFields) {
    throw new Error('Invalid fields in update');
  }
  
  return true;
};
```

## 3. 🔄 Retry механизм

### Автоматические повторы при ошибках
```javascript
const retryOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Экспоненциальная задержка
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

## 4. 📊 Мониторинг ошибок

### Логирование проблемных операций
```javascript
const logFirestoreError = (operation, error, context) => {
  console.error('Firestore Error:', {
    operation,
    error: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Отправка в систему мониторинга
  if (error.message.includes('INTERNAL ASSERTION FAILED')) {
    // Критическая ошибка - уведомить разработчиков
    notifyDevelopers(error, context);
  }
};
```

## 5. 🎯 Специфичные исправления

### Для работы с availableSlots
```javascript
// Атомарное обновление слотов
export const bookTimeSlot = async (slotId, workerId) => {
  const db = getFirestore();
  const slotRef = doc(db, 'availableSlots', slotId);
  
  return runTransaction(db, async (transaction) => {
    const slotDoc = await transaction.get(slotRef);
    
    if (!slotDoc.exists()) {
      throw new Error('Slot not found');
    }
    
    const slotData = slotDoc.data();
    
    if (slotData.isFullyBooked) {
      throw new Error('Slot is fully booked');
    }
    
    const newBookedCount = (slotData.bookedCount || 0) + 1;
    const isFullyBooked = newBookedCount >= slotData.maxCapacity;
    
    transaction.update(slotRef, {
      bookedCount: newBookedCount,
      isFullyBooked,
      updatedAt: serverTimestamp(),
      assignedWorkers: arrayUnion(workerId)
    });
  });
};
```

## 6. 🔧 Настройки Firebase

### Увеличить таймауты
```javascript
// В инициализации Firebase
const firestore = getFirestore();
connectFirestoreEmulator(firestore, 'localhost', 8080, {
  experimentalForceLongPolling: true, // Для стабильности соединения
});

// Настройки для продакшена
const settings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: false
};
```

## 7. 🚀 Рекомендации по деплою

1. **Постепенное обновление правил** - сначала тестовая среда
2. **Мониторинг после деплоя** - отслеживание ошибок
3. **Откат при проблемах** - готовый план отката
4. **Уведомления команды** - при критических ошибках

## 8. 📋 Чеклист исправлений

- [ ] Обновить Firestore Security Rules
- [ ] Добавить транзакции для критических операций  
- [ ] Внедрить debounce для частых обновлений
- [ ] Добавить валидацию на клиенте
- [ ] Настроить retry механизм
- [ ] Добавить логирование ошибок
- [ ] Протестировать на dev окружении
- [ ] Задеплоить с мониторингом