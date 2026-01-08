# 🔥 Правильные Firebase Rules

## Проблема
Ошибка `INTERNAL ASSERTION FAILED` возникает из-за неправильных правил безопасности Firestore.

## ✅ Правильное решение

### 1. Зайдите в Firebase Console
- Откройте ваш проект Firebase
- Перейдите в **Firestore Database**
- Нажмите на вкладку **Rules**

### 2. Замените правила на эти:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для заказов
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Правила для работников
    match /workers/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Правила для слотов доступности
    match /availableSlots/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Все остальные коллекции
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Нажмите **Publish**

## 🎯 Что это дает:

- ✅ **Реактивные обновления** - onSnapshot работает корректно
- ✅ **Серверные временные метки** - правильная синхронизация времени
- ✅ **Автоматическое обновление UI** - без перезагрузок страницы
- ✅ **Безопасность** - доступ только авторизованным пользователям

## 🔧 Альтернативные правила (более строгие):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Заказы - только админы
    match /orders/{document} {
      allow read, write: if request.auth != null && isAdmin();
    }
    
    // Работники - админы могут все, работники только свои данные
    match /workers/{workerId} {
      allow read, write: if request.auth != null && isAdmin();
      allow read, update: if request.auth != null && 
        request.auth.token.email == resource.data.email;
    }
    
    // Функция проверки админа
    function isAdmin() {
      return request.auth.token.email in [
        'admin@brighthouse.pl',
        'manager@brighthouse.pl'
      ];
    }
  }
}
```

## ⚠️ Важно:
После изменения правил подождите 1-2 минуты для их применения.