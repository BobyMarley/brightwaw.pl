# 🚀 Деплой Admin Panel на Railway

## Быстрый старт

### 1. Установка Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Деплой из папки admin-panel
```bash
cd admin-panel
railway init
railway up
```

### 3. Настройка переменных в Railway Dashboard
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Что уже настроено ✅

- ✅ `railway.json` - конфигурация деплоя
- ✅ `nixpacks.toml` - Node.js 20
- ✅ `package.json` - скрипты build и start
- ✅ `vite.config.ts` - настройки для продакшена
- ✅ Firebase конфигурация
- ✅ Оптимизация сборки (chunking)

## После деплоя

1. **Добавить домен в Firebase Console:**
   - Authentication > Settings > Authorized domains
   - Добавить: `your-app.up.railway.app`

2. **Настроить Google Calendar API:**
   - Google Console > Credentials
   - Добавить Railway домен в Authorized origins

3. **Проверить работу:**
   - Авторизация Firebase ✅
   - Подключение к Firestore ✅
   - Google Calendar API ✅

## Обновление

```bash
git add .
git commit -m "Update admin panel"
git push
# Railway автоматически пересоберет
```

## Памятка для следующего раза

Скажи: **"Задеплой admin-panel на Railway, все готово"**

Я выполню:
1. `railway up` из папки admin-panel
2. Проверю переменные окружения
3. Добавлю домен в Firebase Console
4. Протестирую все функции