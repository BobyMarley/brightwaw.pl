# Скрипт для анализа используемых CSS классов

# Читаем используемые классы из HTML
$usedClassesRaw = Get-Content "css_classes_used.txt" -Encoding UTF8
$usedClasses = @()
foreach ($line in $usedClassesRaw) {
    if ($line -match 'class="([^"]*)"') {
        $classes = $matches[1] -split '\s+'
        $usedClasses += $classes
    }
}
$usedClasses = $usedClasses | Sort-Object -Unique

# Читаем определённые селекторы из CSS
$definedSelectors = Get-Content "css_selectors_defined.txt" -Encoding UTF8 | Where-Object { $_ -match '^\.' } | ForEach-Object { $_.Trim() }

# Находим неиспользуемые селекторы
$unusedSelectors = @()
foreach ($selector in $definedSelectors) {
    $className = $selector -replace '^\.',''
    if ($usedClasses -notcontains $className) {
        $unusedSelectors += $selector
    }
}

# Выводим результаты
Write-Host "=== АНАЛИЗ CSS ===" -ForegroundColor Green
Write-Host ""
Write-Host "Всего определено селекторов: $($definedSelectors.Count)" -ForegroundColor Cyan
Write-Host "Используется в HTML: $($usedClasses.Count)" -ForegroundColor Cyan
Write-Host "Неиспользуемых селекторов: $($unusedSelectors.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== НЕИСПОЛЬЗУЕМЫЕ СЕЛЕКТОРЫ ===" -ForegroundColor Red
$unusedSelectors | Out-File "unused_selectors.txt" -Encoding UTF8
$unusedSelectors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
Write-Host ""
Write-Host "Список сохранён в unused_selectors.txt" -ForegroundColor Green
