# Исправление ошибки "Не указан URL значка видео"

## Проблема
Google не может проиндексировать видео, так как отсутствует VideoObject schema с thumbnailUrl.

## Решение
Добавить JSON-LD schema в `<head>` следующих файлов:
- `pranie.html`
- `by/pranie.html`
- `ru/pranie.html` (если есть видео)
- `en/pranie.html` (если есть видео)

## Код для добавления

Вставить перед закрывающим тегом `</head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Химчистка мебели BrightHouse",
  "description": "Профессиональная химчистка мягкой мебели в Варшаве",
  "thumbnailUrl": "https://brightwaw.pl/video/video-poster.jpg",
  "uploadDate": "2024-01-01",
  "contentUrl": "https://brightwaw.pl/video/video.mp4",
  "embedUrl": "https://brightwaw.pl/video/video.mp4",
  "duration": "PT30S"
}
</script>
```

## Для белорусской версии (by/pranie.html):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Хімчыстка мэблі BrightHouse",
  "description": "Прафесійная хімчыстка мяккай мэблі ў Варшаве",
  "thumbnailUrl": "https://brightwaw.pl/video/video-poster.jpg",
  "uploadDate": "2024-01-01",
  "contentUrl": "https://brightwaw.pl/video/video.mp4",
  "embedUrl": "https://brightwaw.pl/video/video.mp4",
  "duration": "PT30S"
}
</script>
```

## Проверка

После добавления проверить в Google Rich Results Test:
https://search.google.com/test/rich-results

Вставить URL: https://brightwaw.pl/pranie.html

Должно показать: ✅ VideoObject detected

## Примечание

- `thumbnailUrl` - обязательное поле (постер видео)
- `duration` - формат ISO 8601 (PT30S = 30 секунд, PT1M30S = 1 мин 30 сек)
- После добавления Google переиндексирует через 1-2 недели
