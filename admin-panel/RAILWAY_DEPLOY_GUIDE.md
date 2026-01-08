# Деплой Admin Panel на Railway

## Подготовка к деплою

### 1. Проверить файлы конфигурации
- ✅ `railway.json` - настроен
- ✅ `nixpacks.toml` - настроен  
- ✅ `package.json` - скрипты готовы
- ✅ `vite.config.ts` - настроен для Railway

### 2. Переменные окружения
В Railway добавить переменные:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
PORT=4173
```

### 3. Команды для деплоя

#### Через Railway CLI:
```bash
# Установить Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация (в папке admin-panel)
cd admin-panel
railway init

# Деплой
railway up
```

#### Через GitHub:
1. Пушнуть код в репозиторий
2. Подключить репозиторий в Railway Dashboard
3. Указать папку: `admin-panel`
4. Railway автоматически задеплоит

### 4. Настройки в Railway Dashboard

**Build Settings:**
- Root Directory: `admin-panel`
- Build Command: `npm run build`
- Start Command: `npm start`

**Environment Variables:**
- `VITE_GOOGLE_CLIENT_ID` - из Google Console
- `PORT` - автоматически устанавливается Railway

### 5. Проверка после деплоя

1. Открыть URL от Railway
2. Проверить авторизацию Firebase
3. Проверить подключение к Firestore
4. Проверить Google Calendar API

### 6. Возможные проблемы

**Проблема:** Build fails
**Решение:** Проверить Node.js версию в nixpacks.toml

**Проблема:** Firebase не подключается
**Решение:** Проверить домен в Firebase Console > Authentication > Authorized domains

**Проблема:** Google Calendar не работает
**Решение:** Добавить Railway домен в Google Console > Credentials

### 7. Обновление

```bash
# Локальные изменения
git add .
git commit -m "Update admin panel"
git push

# Railway автоматически пересоберет
```

## Памятка для следующего раза

Скажи мне: **"Задеплой admin-panel на Railway, все настройки готовы"**

Я проверю:
- Railway.json и nixpacks.toml
- Firebase конфигурацию
- Переменные окружения
- Vite настройки для продакшена