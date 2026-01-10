#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
АГРЕССИВНЫЙ АНАЛИЗ ДУБЛИКАТОВ И ИЗБЫТОЧНОСТИ В CSS
Находит: дублирующиеся правила, одинаковые значения, избыточные селекторы
"""

import re
from collections import defaultdict
import hashlib

CSS_FILE = 'index.css'

def parse_css_rules(content):
    """Парсит CSS и извлекает все правила"""
    # Удаляем комментарии
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    rules = []
    media_queries = []
    
    # Извлекаем медиа-запросы
    media_pattern = r'@media\s*([^{]+)\s*{((?:[^{}]|{[^{}]*})*)}' 
    for match in re.finditer(media_pattern, content, re.DOTALL):
        media_query = match.group(1).strip()
        media_content = match.group(2)
        media_queries.append({
            'query': media_query,
            'content': media_content,
            'full': match.group(0)
        })
    
    # Удаляем медиа-запросы из основного контента
    content_no_media = re.sub(media_pattern, '', content, flags=re.DOTALL)
    
    # Извлекаем обычные правила
    rule_pattern = r'([^{}]+)\s*{([^{}]+)}'
    for match in re.finditer(rule_pattern, content_no_media):
        selectors = match.group(1).strip()
        properties = match.group(2).strip()
        
        if selectors and properties and not selectors.startswith('@'):
            rules.append({
                'selectors': selectors,
                'properties': properties,
                'full': match.group(0)
            })
    
    return rules, media_queries

def normalize_properties(props):
    """Нормализует свойства для сравнения"""
    # Разбиваем на отдельные свойства
    prop_list = []
    for prop in props.split(';'):
        prop = prop.strip()
        if prop:
            # Убираем лишние пробелы
            prop = re.sub(r'\s+', ' ', prop)
            prop_list.append(prop)
    return sorted(prop_list)

def find_duplicate_rules(rules):
    """Находит полностью дублирующиеся правила"""
    duplicates = defaultdict(list)
    
    for i, rule in enumerate(rules):
        # Создаём хеш из нормализованных свойств
        props_normalized = tuple(normalize_properties(rule['properties']))
        props_hash = hashlib.md5(str(props_normalized).encode()).hexdigest()
        
        duplicates[props_hash].append({
            'index': i,
            'selectors': rule['selectors'],
            'properties': rule['properties']
        })
    
    # Оставляем только дубликаты (где больше 1 правила)
    real_duplicates = {k: v for k, v in duplicates.items() if len(v) > 1}
    
    return real_duplicates

def find_similar_selectors(rules):
    """Находит селекторы с очень похожими свойствами"""
    similar = []
    
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            props1 = set(normalize_properties(rules[i]['properties']))
            props2 = set(normalize_properties(rules[j]['properties']))
            
            # Если 80%+ свойств совпадают
            if len(props1) > 0 and len(props2) > 0:
                overlap = len(props1 & props2)
                similarity = overlap / max(len(props1), len(props2))
                
                if similarity >= 0.8:
                    similar.append({
                        'selector1': rules[i]['selectors'],
                        'selector2': rules[j]['selectors'],
                        'similarity': similarity,
                        'common_props': list(props1 & props2),
                        'unique1': list(props1 - props2),
                        'unique2': list(props2 - props1)
                    })
    
    return similar

def analyze_property_usage(rules):
    """Анализирует использование свойств"""
    property_count = defaultdict(int)
    property_values = defaultdict(set)
    
    for rule in rules:
        for prop in rule['properties'].split(';'):
            prop = prop.strip()
            if ':' in prop:
                name, value = prop.split(':', 1)
                name = name.strip()
                value = value.strip()
                property_count[name] += 1
                property_values[name].add(value)
    
    return property_count, property_values

def find_redundant_media_queries(media_queries):
    """Находит избыточные медиа-запросы"""
    # Группируем по условию
    grouped = defaultdict(list)
    
    for mq in media_queries:
        # Нормализуем запрос
        query_normalized = re.sub(r'\s+', ' ', mq['query']).strip()
        grouped[query_normalized].append(mq)
    
    return grouped

def main():
    print("=" * 80)
    print("АГРЕССИВНЫЙ АНАЛИЗ ДУБЛИКАТОВ И ИЗБЫТОЧНОСТИ")
    print("=" * 80)
    
    with open(CSS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"\n📊 Исходный файл: {len(content)} символов")
    
    # Парсим CSS
    print("\n🔍 Парсинг CSS...")
    rules, media_queries = parse_css_rules(content)
    print(f"  ✓ Найдено правил: {len(rules)}")
    print(f"  ✓ Найдено медиа-запросов: {len(media_queries)}")
    
    # Ищем дубликаты
    print("\n🔎 Поиск дубликатов...")
    duplicates = find_duplicate_rules(rules)
    total_duplicate_rules = sum(len(v) - 1 for v in duplicates.values())
    print(f"  ✓ Найдено групп дубликатов: {len(duplicates)}")
    print(f"  ✓ Можно удалить правил: {total_duplicate_rules}")
    
    # Ищем похожие селекторы
    print("\n🔎 Поиск похожих правил (80%+ совпадение)...")
    similar = find_similar_selectors(rules)
    print(f"  ✓ Найдено похожих пар: {len(similar)}")
    
    # Анализ свойств
    print("\n📊 Анализ использования свойств...")
    prop_count, prop_values = analyze_property_usage(rules)
    print(f"  ✓ Уникальных свойств: {len(prop_count)}")
    
    # Топ-10 самых используемых свойств
    top_props = sorted(prop_count.items(), key=lambda x: x[1], reverse=True)[:10]
    print("\n  📌 Топ-10 свойств:")
    for prop, count in top_props:
        print(f"     {prop}: {count} раз")
    
    # Анализ медиа-запросов
    print("\n🔎 Анализ медиа-запросов...")
    grouped_mq = find_redundant_media_queries(media_queries)
    print(f"  ✓ Уникальных условий: {len(grouped_mq)}")
    print(f"  ✓ Можно объединить: {len(media_queries) - len(grouped_mq)} запросов")
    
    # Сохраняем детальный отчёт
    with open('duplicate_analysis.txt', 'w', encoding='utf-8') as f:
        f.write("АНАЛИЗ ДУБЛИКАТОВ И ИЗБЫТОЧНОСТИ\n")
        f.write("=" * 80 + "\n\n")
        
        f.write(f"СТАТИСТИКА:\n")
        f.write(f"  Всего правил: {len(rules)}\n")
        f.write(f"  Групп дубликатов: {len(duplicates)}\n")
        f.write(f"  Можно удалить: {total_duplicate_rules} правил\n")
        f.write(f"  Похожих пар: {len(similar)}\n")
        f.write(f"  Медиа-запросов: {len(media_queries)}\n")
        f.write(f"  Можно объединить: {len(media_queries) - len(grouped_mq)}\n\n")
        
        f.write("ДУБЛИКАТЫ (первые 20 групп):\n")
        f.write("-" * 80 + "\n")
        for i, (hash_val, dup_list) in enumerate(list(duplicates.items())[:20], 1):
            f.write(f"\nГруппа {i} ({len(dup_list)} дубликатов):\n")
            for dup in dup_list:
                f.write(f"  Селектор: {dup['selectors']}\n")
            f.write(f"  Свойства: {dup_list[0]['properties'][:100]}...\n")
        
        f.write("\n\nПОХОЖИЕ ПРАВИЛА (первые 30):\n")
        f.write("-" * 80 + "\n")
        for i, sim in enumerate(similar[:30], 1):
            f.write(f"\n{i}. Похожесть: {sim['similarity']:.0%}\n")
            f.write(f"   Селектор 1: {sim['selector1']}\n")
            f.write(f"   Селектор 2: {sim['selector2']}\n")
            f.write(f"   Общих свойств: {len(sim['common_props'])}\n")
            if sim['unique1']:
                f.write(f"   Уникальные 1: {', '.join(sim['unique1'][:3])}\n")
            if sim['unique2']:
                f.write(f"   Уникальные 2: {', '.join(sim['unique2'][:3])}\n")
        
        f.write("\n\nМЕДИА-ЗАПРОСЫ ПО ГРУППАМ:\n")
        f.write("-" * 80 + "\n")
        for query, mq_list in grouped_mq.items():
            f.write(f"\n@media {query} ({len(mq_list)} вхождений)\n")
    
    print(f"\n📊 Детальный отчёт: duplicate_analysis.txt")
    
    # Подсчёт потенциальной экономии
    potential_savings = total_duplicate_rules
    print(f"\n💾 ПОТЕНЦИАЛЬНАЯ ЭКОНОМИЯ:")
    print(f"   Удаление дубликатов: ~{total_duplicate_rules} правил")
    print(f"   Объединение похожих: ~{len(similar) // 2} правил")
    print(f"   Объединение медиа-запросов: ~{len(media_queries) - len(grouped_mq)} блоков")
    print(f"   ИТОГО: можно сократить на ~{potential_savings + len(similar)//2} правил")
    
    current_lines = len(content.split('\n'))
    estimated_lines = current_lines - (potential_savings + len(similar)//2) * 5
    print(f"\n📏 ОЦЕНКА СТРОК:")
    print(f"   Сейчас: {current_lines} строк")
    print(f"   После оптимизации: ~{estimated_lines} строк")
    print(f"   Экономия: ~{current_lines - estimated_lines} строк ({(current_lines - estimated_lines) / current_lines * 100:.1f}%)")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
