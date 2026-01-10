#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DEEP CSS ANALYSIS - Полный анализ всех зависимостей
Учитывает: классы, ID, псевдоклассы, медиа-запросы, динамические классы из JS
"""

import re
import os
from collections import defaultdict

HTML_FILES = ['index.html', 'cennik.html', 'sprzatanie-mieszkan-warszawa.html']
JS_FILES = ['vanilla-app.js', 'form.js', 'modal.js', 'data.js']
CSS_FILE = 'index.css'

def extract_all_from_html(filepath):
    """Извлекает ВСЁ из HTML: классы, ID, атрибуты"""
    classes = set()
    ids = set()
    attributes = set()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Классы
            class_matches = re.findall(r'class=["\']([^"\']+)["\']', content)
            for match in class_matches:
                classes.update(match.split())
            
            # ID
            id_matches = re.findall(r'id=["\']([^"\']+)["\']', content)
            ids.update(id_matches)
            
            # data-атрибуты (могут использоваться в CSS)
            data_attrs = re.findall(r'data-([a-z-]+)=', content)
            attributes.update(data_attrs)
            
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return classes, ids, attributes

def extract_all_from_js(filepath):
    """Извлекает ВСЁ из JS: классы, ID, селекторы"""
    classes = set()
    ids = set()
    selectors = set()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # classList операции
            class_ops = re.findall(r'classList\.(add|remove|toggle|contains)\(["\']([^"\']+)["\']\)', content)
            for _, classname in class_ops:
                classes.add(classname)
            
            # className присваивания
            classname_assigns = re.findall(r'className\s*=\s*["\']([^"\']+)["\']', content)
            for match in classname_assigns:
                classes.update(match.split())
            
            # querySelector/querySelectorAll с классами
            query_classes = re.findall(r'querySelector(?:All)?\(["\']\.([a-zA-Z0-9_-]+)', content)
            classes.update(query_classes)
            
            # querySelector/querySelectorAll с ID
            query_ids = re.findall(r'querySelector(?:All)?\(["\']#([a-zA-Z0-9_-]+)', content)
            ids.update(query_ids)
            
            # getElementById
            get_by_id = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', content)
            ids.update(get_by_id)
            
            # Любые селекторы в кавычках (могут быть сложные)
            all_selectors = re.findall(r'querySelector(?:All)?\(["\']([^"\']+)["\']\)', content)
            selectors.update(all_selectors)
            
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return classes, ids, selectors

def extract_all_css_selectors(filepath):
    """Извлекает ВСЕ селекторы из CSS включая псевдоклассы и медиа-запросы"""
    result = {
        'classes': set(),
        'ids': set(),
        'pseudo_classes': set(),
        'pseudo_elements': set(),
        'media_queries': [],
        'keyframes': set(),
        'element_selectors': set(),
        'complex_selectors': []
    }
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Удаляем комментарии
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            
            # Медиа-запросы
            media_blocks = re.findall(r'@media\s*([^{]+)\s*{([^}]+(?:{[^}]*}[^}]*)*)}', content, re.DOTALL)
            for media_query, media_content in media_blocks:
                result['media_queries'].append({
                    'query': media_query.strip(),
                    'content': media_content
                })
            
            # Keyframes
            keyframes = re.findall(r'@keyframes\s+([a-zA-Z0-9_-]+)', content)
            result['keyframes'].update(keyframes)
            
            # Все селекторы (перед {)
            selector_blocks = re.findall(r'([^{}@]+)\s*{', content)
            
            for block in selector_blocks:
                # Пропускаем @-правила
                if '@' in block:
                    continue
                    
                # Разделяем по запятой
                individual_selectors = block.split(',')
                
                for selector in individual_selectors:
                    selector = selector.strip()
                    if not selector:
                        continue
                    
                    # Сохраняем сложный селектор целиком
                    result['complex_selectors'].append(selector)
                    
                    # Извлекаем классы
                    classes = re.findall(r'\.([a-zA-Z0-9_-]+)', selector)
                    result['classes'].update(classes)
                    
                    # Извлекаем ID
                    ids = re.findall(r'#([a-zA-Z0-9_-]+)', selector)
                    result['ids'].update(ids)
                    
                    # Псевдоклассы (:hover, :active, :focus и т.д.)
                    pseudo_classes = re.findall(r':([a-zA-Z0-9_-]+)(?:\(|{|\s|,|$)', selector)
                    result['pseudo_classes'].update(pseudo_classes)
                    
                    # Псевдоэлементы (::before, ::after)
                    pseudo_elements = re.findall(r'::([a-zA-Z0-9_-]+)', selector)
                    result['pseudo_elements'].update(pseudo_elements)
                    
                    # Элементы (div, p, section и т.д.)
                    # Ищем слова, которые не начинаются с . # : или [
                    elements = re.findall(r'(?:^|\s)([a-z][a-z0-9]*)\b(?!["\'])', selector.lower())
                    result['element_selectors'].update(elements)
    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return result

def main():
    print("=" * 80)
    print("ГЛУБОКИЙ АНАЛИЗ CSS - ПОЛНАЯ КАРТИНА")
    print("=" * 80)
    
    # Собираем данные из HTML
    html_classes = set()
    html_ids = set()
    html_attrs = set()
    
    print("\n📄 Анализ HTML файлов...")
    for html_file in HTML_FILES:
        if os.path.exists(html_file):
            classes, ids, attrs = extract_all_from_html(html_file)
            html_classes.update(classes)
            html_ids.update(ids)
            html_attrs.update(attrs)
            print(f"  ✓ {html_file}: {len(classes)} классов, {len(ids)} ID, {len(attrs)} data-атрибутов")
    
    # Собираем данные из JS
    js_classes = set()
    js_ids = set()
    js_selectors = set()
    
    print("\n📜 Анализ JavaScript файлов...")
    for js_file in JS_FILES:
        if os.path.exists(js_file):
            classes, ids, selectors = extract_all_from_js(js_file)
            js_classes.update(classes)
            js_ids.update(ids)
            js_selectors.update(selectors)
            print(f"  ✓ {js_file}: {len(classes)} классов, {len(ids)} ID, {len(selectors)} селекторов")
    
    # Все используемые классы и ID
    all_used_classes = html_classes | js_classes
    all_used_ids = html_ids | js_ids
    
    # Анализ CSS
    print(f"\n🎨 Глубокий анализ CSS файла: {CSS_FILE}...")
    css_data = extract_all_css_selectors(CSS_FILE)
    
    # Находим неиспользуемые
    unused_classes = css_data['classes'] - all_used_classes
    unused_ids = css_data['ids'] - all_used_ids
    
    # Результаты
    print("\n" + "=" * 80)
    print("РЕЗУЛЬТАТЫ ГЛУБОКОГО АНАЛИЗА")
    print("=" * 80)
    
    print(f"\n✅ ИСПОЛЬЗУЕТСЯ в HTML/JS:")
    print(f"   Классов: {len(all_used_classes)}")
    print(f"   ID: {len(all_used_ids)}")
    
    print(f"\n📋 ОПРЕДЕЛЕНО в CSS:")
    print(f"   Классов: {len(css_data['classes'])}")
    print(f"   ID: {len(css_data['ids'])}")
    print(f"   Псевдоклассов: {len(css_data['pseudo_classes'])} ({', '.join(sorted(list(css_data['pseudo_classes']))[:10])}...)")
    print(f"   Псевдоэлементов: {len(css_data['pseudo_elements'])} ({', '.join(css_data['pseudo_elements'])})")
    print(f"   Медиа-запросов: {len(css_data['media_queries'])}")
    print(f"   Keyframes: {len(css_data['keyframes'])} ({', '.join(css_data['keyframes'])})")
    print(f"   Сложных селекторов: {len(css_data['complex_selectors'])}")
    
    print(f"\n❌ ПОТЕНЦИАЛЬНО НЕИСПОЛЬЗУЕМЫЕ:")
    print(f"   Классов: {len(unused_classes)}")
    print(f"   ID: {len(unused_ids)}")
    
    # Детальный отчёт
    with open('deep_css_analysis.txt', 'w', encoding='utf-8') as f:
        f.write("ГЛУБОКИЙ АНАЛИЗ CSS\n")
        f.write("=" * 80 + "\n\n")
        
        f.write(f"ИСПОЛЬЗУЕМЫЕ КЛАССЫ ({len(all_used_classes)}):\n")
        f.write("-" * 80 + "\n")
        for cls in sorted(all_used_classes):
            f.write(f"  .{cls}\n")
        
        f.write(f"\n\nИСПОЛЬЗУЕМЫЕ ID ({len(all_used_ids)}):\n")
        f.write("-" * 80 + "\n")
        for id_name in sorted(all_used_ids):
            f.write(f"  #{id_name}\n")
        
        f.write(f"\n\nНЕИСПОЛЬЗУЕМЫЕ КЛАССЫ ({len(unused_classes)}):\n")
        f.write("-" * 80 + "\n")
        for cls in sorted(unused_classes):
            f.write(f"  .{cls}\n")
        
        f.write(f"\n\nПСЕВДОКЛАССЫ В CSS ({len(css_data['pseudo_classes'])}):\n")
        f.write("-" * 80 + "\n")
        for pc in sorted(css_data['pseudo_classes']):
            f.write(f"  :{pc}\n")
        
        f.write(f"\n\nПСЕВДОЭЛЕМЕНТЫ В CSS ({len(css_data['pseudo_elements'])}):\n")
        f.write("-" * 80 + "\n")
        for pe in sorted(css_data['pseudo_elements']):
            f.write(f"  ::{pe}\n")
        
        f.write(f"\n\nМЕДИА-ЗАПРОСЫ ({len(css_data['media_queries'])}):\n")
        f.write("-" * 80 + "\n")
        for i, mq in enumerate(css_data['media_queries'], 1):
            f.write(f"  {i}. @media {mq['query']}\n")
        
        f.write(f"\n\nKEYFRAMES ({len(css_data['keyframes'])}):\n")
        f.write("-" * 80 + "\n")
        for kf in sorted(css_data['keyframes']):
            f.write(f"  @keyframes {kf}\n")
        
        f.write(f"\n\nСЛОЖНЫЕ СЕЛЕКТОРЫ (первые 50):\n")
        f.write("-" * 80 + "\n")
        for sel in css_data['complex_selectors'][:50]:
            f.write(f"  {sel}\n")
    
    print(f"\n📊 Детальный отчёт сохранён: deep_css_analysis.txt")
    
    # Критические классы, которые НЕЛЬЗЯ удалять
    critical_patterns = ['active', 'is-', 'has-', 'hover', 'focus', 'disabled', 'checked', 'visible', 'hidden', 'shake', 'sending']
    critical_classes = set()
    for cls in css_data['classes']:
        for pattern in critical_patterns:
            if pattern in cls.lower():
                critical_classes.add(cls)
                break
    
    print(f"\n⚠️  КРИТИЧЕСКИЕ КЛАССЫ (состояния, нельзя удалять): {len(critical_classes)}")
    print(f"    {', '.join(sorted(list(critical_classes))[:15])}...")
    
    print("\n" + "=" * 80)
    print("✅ Глубокий анализ завершён!")
    print("=" * 80)

if __name__ == "__main__":
    main()
