# ПОЭТАПНЫЙ РЕФАКТОРИНГ CSS - ИНСТРУКЦИИ ДЛЯ ОТКАТА

## Этап 1: Удаление дубликатов land-* (строки 4152-4510)

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase1"
```

### Откат (если что-то сломалось)
```powershell
Copy-Item "index.css.phase1" -Destination "index.css" -Force
```

### Что удаляем
- Строки 4152-4510 (полные дубликаты .land-hero, .land-btn, .land-card и т.д.)

### Тест
- Открыть sprzatanie-mieszkan-warszawa.html
- Проверить hero секцию
- Проверить кнопки
- Проверить карточки

---

## Этап 2: Объединение FAQ стилей

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase2"
```

### Откат
```powershell
Copy-Item "index.css.phase2" -Destination "index.css" -Force
```

### Что удаляем
- Все .faq-* стили (оставляем только .ref-faq-*)

### Тест
- Открыть index.html
- Проверить FAQ секцию
- Проверить аккордеон

---

## Этап 3: Консолидация медиа-запросов

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase3"
```

### Откат
```powershell
Copy-Item "index.css.phase3" -Destination "index.css" -Force
```

### Что делаем
- Объединяем дублирующиеся @media запросы

### Тест
- Проверить на 375px (mobile)
- Проверить на 768px (tablet)
- Проверить на 1920px (desktop)

---

## Этап 4: Удаление неиспользуемых классов

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase4"
```

### Откат
```powershell
Copy-Item "index.css.phase4" -Destination "index.css" -Force
```

### Что удаляем
- 100 неиспользуемых классов из списка

### Тест
- Проверить все 3 страницы
- Проверить все секции

---

## Этап 5: Унификация кнопок

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase5"
```

### Откат
```powershell
Copy-Item "index.css.phase5" -Destination "index.css" -Force
```

### Что делаем
- Создаём базовый .btn
- Объединяем похожие кнопки

### Тест
- Проверить все кнопки на всех страницах

---

## Этап 6: Финальная минификация

### Бэкап
```powershell
Copy-Item "index.css" -Destination "index.css.phase6"
```

### Откат
```powershell
Copy-Item "index.css.phase6" -Destination "index.css" -Force
```

### Что делаем
- Удаляем комментарии
- Сжимаем пробелы
- Оптимизируем значения

### Тест
- Полная проверка всех 3 страниц
- Все интерактивные элементы
- Все размеры экрана

---

## ПОЛНЫЙ ОТКАТ К НАЧАЛУ

```powershell
Copy-Item "index.css.backup_2026-01-10" -Destination "index.css" -Force
```
