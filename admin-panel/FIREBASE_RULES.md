# 🔥 Firebase Security Rules

## Firestore Rules

Замените правила в Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для заказов - только админы
    match /orders/{document} {
      allow read, write: if request.auth != null && isAdmin();
    }
    
    // Правила для работников
    match /workers/{document} {
      allow read, write: if request.auth != null && isAdmin();
      allow read, update: if request.auth != null && 
        request.auth.token.email == resource.data.email;
    }
    
    // Правила для слотов доступности - только админы
    match /availableSlots/{document} {
      allow read, write: if request.auth != null && isAdmin();
    }
    
    // Функция проверки админа
    function isAdmin() {
      // Проверяем, что пользователь НЕ является работником
      return !exists(/databases/$(database)/documents/workers/$(request.auth.uid)) &&
             !existsByEmail(request.auth.token.email);
    }
    
    // Функция проверки существования работника по email
    function existsByEmail(email) {
      return exists(/databases/$(database)/documents/workers/$(email));
    }
  }
}
```

## Упрощенные правила (для начала):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Временно разрешаем всем авторизованным пользователям
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```