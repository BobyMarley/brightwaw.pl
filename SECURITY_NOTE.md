# Заметка о безопасности

## Текущая реализация

### Проблема:
Firestore Rules не поддерживают запросы `array-contains` для фильтрации на уровне базы данных.

### Текущее решение:
```javascript
allow read: if request.auth != null;
```

Это означает, что **любой авторизованный пользователь может читать все заказы**.

### Фильтрация на клиенте:
```javascript
const myOrders = allOrders.filter(order => {
    if (order.assignedWorkers?.includes(workerId)) return true;
    if (order.assignedWorkerId === workerId) return true;
    return false;
});
```

## Уровень безопасности:

### ✅ Приемлемо для:
- Внутренних систем (работники - доверенные лица)
- Малого бизнеса
- MVP и прототипов

### ❌ НЕ подходит для:
- Публичных приложений
- Систем с конфиденциальными данными клиентов
- Больших компаний с высокими требованиями к безопасности

## Альтернативные решения:

### 1. Cloud Functions (рекомендуется)
Создать защищенную Cloud Function:
```javascript
exports.getMyOrders = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const orders = await admin.firestore()
        .collection('orders')
        .where('assignedWorkers', 'array-contains', uid)
        .get();
    return orders.docs.map(doc => doc.data());
});
```

Firestore Rules:
```javascript
allow read: if isAdmin() || 
               (request.auth != null && request.auth.uid == resource.data.userId);
```

### 2. Отдельная коллекция workerOrders
Структура:
```
workerOrders/{workerId}/orders/{orderId}
```

При назначении работника создавать документ в этой коллекции.

### 3. Денормализация данных
Хранить минимальную информацию о заказе в документе работника:
```javascript
workers/{workerId} {
    myOrders: [
        { orderId: 'xxx', date: '2024-12-20', address: '...' }
    ]
}
```

## Рекомендация:

Для production используйте **Cloud Functions** (решение 1). Это:
- ✅ Безопасно
- ✅ Масштабируемо
- ✅ Не требует изменения структуры БД
- ✅ Легко внедрить

## Временное решение (текущее):

Оставить `allow read: if request.auth != null;` до внедрения Cloud Functions.

**Риски:**
- Работник может увидеть чужие заказы через DevTools
- Но не может их изменить (защищено правилами update)
- Для внутренней системы это приемлемо

**Митигация:**
- Обучить работников не смотреть чужие данные
- Логировать все действия
- Регулярный аудит доступа
