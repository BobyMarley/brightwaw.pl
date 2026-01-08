# Instrukcje Odsunięcia Zmian SEO

## Status: ZAKTUALIZOWANO - Zmniejszono keyword stuffing, różnicowano strony usług

## Jeśli chcesz cofnąć wszystkie zmiany, wykonaj poniższe kroki:

### 1. Przywróć główną stronę
```powershell
Copy-Item "ru/index.html.backup" "ru/index.html" -Force
```

### 2. Usuń nowe strony usług
```powershell
Remove-Item "ru/generalnaya-uborka.html" -Force
Remove-Item "ru/standartnaya-uborka.html" -Force
```

### 3. Usuń plik instrukcji
```powershell
Remove-Item "ROLLBACK_INSTRUCTIONS.md" -Force
```

---

## Ostatnie zmiany (v2):

### 1. **Zmniejszono keyword stuffing na głównej stronie**
- ✅ H1 przywrócony do: "Уборка Квартир в Варшаве от 160 zł"
- ✅ Title zmieniony na: "Уборка Квартир Варшава от 160 zł | Генеральная Уборка"
- ✅ Meta description - bardziej naturalna
- ✅ H2 nagłówki - usunięto nadmiar ключевых слов
- ✅ FAQ - zmieniony na ogólny

### 2. **Różnicowano strony usług**
- ✅ **remont.html** - specyficzna dla "Уборка после ремонта"
  - Fokus na: usuwanie pыли, ochronę materiałów, usuwanie resztek budowlanych
  - Karty: Pыль, Plёнki, Materiały, Okna
  
- ✅ **generalnaya-uborka.html** - ogólna "Генеральная уборка"
  - Fokus na: głęboką czyszczenie, polировку, ogólne usługi
  - Karty: Głębokie czyszczenie, Okna/Lustra, Polировка, Sanuzły

- ✅ **standartnaya-uborka.html** - "Стандартная уборка"
  - Fokus na: regularne czyszczenie, tańsze usługi

---

## Co zostało zmienione (v1):

### 1. **ru/index.html** - Główna strona
- ✅ Zaktualizowany title (dodano "Генеральная уборка" i "Уборка после ремонта")
- ✅ Zaktualizowany meta description (bardziej konkretny)
- ✅ Zmieniony H1 (bardziej konkretny, z usługami)
- ✅ Zmieniony H2 "Услуги Уборки" → "Генеральная и Стандартная Уборка Квартир Варшава"
- ✅ Dodana nowa sekcja "Наши Основные Услуги Уборки" z 4 kartami usług
- ✅ Zmieniony H2 "Что входит" → "Что Входит в Стандартную и Генеральную Уборку"
- ✅ Zmieniony H2 "Почему выбирают" → "Почему Выбирают BrightHouse для Уборки Квартир"
- ✅ Zmieniony H2 "Наши Работы" → "Примеры Генеральной Уборки и Уборки После Ремонта"
- ✅ Zmieniony H2 FAQ → "Часто Задаваемые Вопросы о Генеральной Уборке и Уборке Квартир"
- ✅ Dodane linki do nowych stron w menu (Генеральная уборка)
- ✅ Zaktualizowane linki w kartach usług

### 2. **ru/generalnaya-uborka.html** - Nowa strona
- ✅ Dedykowana strona dla "Генеральная уборка"
- ✅ Optymalizowany title, meta description, keywords
- ✅ Hłebne kruszki (breadcrumbs)
- ✅ Schema.org strukturalne dane
- ✅ Zawartość dostosowana do usługi

### 3. **ru/standartnaya-uborka.html** - Nowa strona
- ✅ Dedykowana strona dla "Стандартная уборка"
- ✅ Optymalizowany title, meta description, keywords
- ✅ Hłebne kruszki (breadcrumbs)
- ✅ Schema.org strukturalne dane
- ✅ Zawartość dostosowana do usługi

### 4. **ru/index.html.backup** - Rezerwowa kopia
- ✅ Kopia oryginalnej głównej strony

---

## Oczekiwane rezultaty:

1. **Lepsze pozycjonowanie** dla zapytań:
   - "генеральная уборка варшава"
   - "стандартная уборка квартир"
   - "уборка квартир варшава"
   - "уборка после ремонта"

2. **Wewnętrzne linki** (internal linking) pomagają Google zrozumieć strukturę

3. **Dedykowane strony** dla każdej usługi zwiększają szanse na ranking

4. **Lepsze CTR** dzięki bardziej konkretnym title i meta description

---

## Monitorowanie:

Sprawdzaj Google Search Console co 2-3 tygodnie, aby zobaczyć:
- Wzrost impressions dla konkretnych usług
- Wzrost CTR
- Poprawę pozycji dla "генеральная уборка" i "стандартная уборка"
