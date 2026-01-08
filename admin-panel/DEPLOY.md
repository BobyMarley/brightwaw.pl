# Деплой Admin Panel на Railway

## Шаги:

### 1. Подготовка
```bash
cd admin-panel
npm install
npm run build  # Проверка сборки
```

### 2. Создайте .env.local с вашими данными:
```
VITE_GOOGLE_CLIENT_ID=ваш_google_client_id
```

### 3. Деплой на Railway

#### Через GitHub:
1. Загрузите код на GitHub
2. Зайдите на https://railway.app
3. New Project → Deploy from GitHub repo
4. Выберите репозиторий
5. Railway автоматически определит настройки

#### Через Railway CLI:
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### 4. Настройте переменные окружения в Railway:
- `VITE_GOOGLE_CLIENT_ID` = ваш Google Client ID

### 5. Обновите Google OAuth redirect URIs:
Добавьте в Google Cloud Console:
```
https://ваш-домен.railway.app
```

## Проверка:
После деплоя откройте URL от Railway и проверьте работу панели.

## Важно:
- Firebase настройки уже в коде (firebase.ts)
- Google Client ID добавьте в переменные окружения Railway
- Домен Railway добавьте в Google OAuth настройки
