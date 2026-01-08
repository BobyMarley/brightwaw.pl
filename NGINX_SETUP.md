# Настройка Nginx для brightwaw.pl

## 📋 Установка конфигурации

### 1. Скопировать конфигурацию на сервер

```bash
# Скопировать файл nginx-config.conf на сервер
scp nginx-config.conf user@server:/etc/nginx/sites-available/brightwaw.pl
```

### 2. Отредактировать пути к SSL сертификатам

```bash
# На сервере отредактировать файл
sudo nano /etc/nginx/sites-available/brightwaw.pl

# Заменить:
ssl_certificate /path/to/ssl/cert.pem;
ssl_certificate_key /path/to/ssl/key.pem;

# На реальные пути, например:
ssl_certificate /etc/letsencrypt/live/brightwaw.pl/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/brightwaw.pl/privkey.pem;
```

### 3. Создать симлинк

```bash
sudo ln -s /etc/nginx/sites-available/brightwaw.pl /etc/nginx/sites-enabled/
```

### 4. Проверить конфигурацию

```bash
sudo nginx -t
```

### 5. Перезапустить Nginx

```bash
sudo systemctl reload nginx
# или
sudo service nginx reload
```

## 🔒 Если нет SSL сертификата

### Установить Let's Encrypt (Certbot)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d brightwaw.pl -d www.brightwaw.pl

# Автообновление (уже настроено автоматически)
sudo certbot renew --dry-run
```

## ✅ Проверка работы

После установки проверьте:

1. **HTTP → HTTPS редирект:**
   ```bash
   curl -I http://brightwaw.pl
   # Должен вернуть: 301 Moved Permanently
   # Location: https://brightwaw.pl
   ```

2. **www → non-www редирект:**
   ```bash
   curl -I https://www.brightwaw.pl
   # Должен вернуть: 301 Moved Permanently
   # Location: https://brightwaw.pl
   ```

3. **Блокировка служебных папок:**
   ```bash
   curl -I https://brightwaw.pl/admin-panel/
   # Должен вернуть: 404 Not Found
   ```

4. **Gzip сжатие:**
   ```bash
   curl -I -H "Accept-Encoding: gzip" https://brightwaw.pl/
   # Должен содержать: Content-Encoding: gzip
   ```

5. **Security Headers:**
   ```bash
   curl -I https://brightwaw.pl/
   # Должен содержать:
   # X-Content-Type-Options: nosniff
   # X-Frame-Options: SAMEORIGIN
   # X-XSS-Protection: 1; mode=block
   ```

## 🚀 Оптимизация (опционально)

### Добавить HTTP/2 Server Push (если нужно)

```nginx
location = /index.html {
    http2_push /public/logo.svg;
    http2_push /index.min.css;
}
```

### Увеличить лимиты (если нужно)

```nginx
client_max_body_size 10M;
client_body_buffer_size 128k;
```

## 📊 Логи

Просмотр логов:

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

## ⚠️ Важно

- Замените `/var/www/brightwaw.pl` на реальный путь к файлам сайта
- Убедитесь что у Nginx есть права на чтение файлов
- После любых изменений проверяйте конфигурацию: `sudo nginx -t`
- Не забудьте настроить автообновление SSL сертификатов
