#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive CSS Analysis Tool
Analyzes HTML and JavaScript files to find all used CSS classes and IDs
"""

import re
import os
from pathlib import Path
from collections import defaultdict

# Files to analyze
HTML_FILES = [
    'index.html',
    'cennik.html',
    'sprzatanie-mieszkan-warszawa.html'
]

JS_FILES = [
    'vanilla-app.js',
    'form.js',
    'modal.js',
    'data.js'
]

CSS_FILE = 'index.css'

def extract_classes_from_html(filepath):
    """Extract all class names from HTML file"""
    classes = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find class="..." and class='...'
            class_matches = re.findall(r'class=["\']([^"\']+)["\']', content)
            for match in class_matches:
                # Split multiple classes
                classes.update(match.split())
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return classes

def extract_ids_from_html(filepath):
    """Extract all ID names from HTML file"""
    ids = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find id="..." and id='...'
            id_matches = re.findall(r'id=["\']([^"\']+)["\']', content)
            ids.update(id_matches)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return ids

def extract_classes_from_js(filepath):
    """Extract class names from JavaScript files"""
    classes = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find classList.add, classList.remove, classList.toggle
            class_methods = re.findall(r'classList\.(add|remove|toggle)\(["\']([^"\']+)["\']\)', content)
            for _, classname in class_methods:
                classes.add(classname)
            
            # Find className = "..."
            classname_assigns = re.findall(r'className\s*=\s*["\']([^"\']+)["\']', content)
            for match in classname_assigns:
                classes.update(match.split())
            
            # Find querySelector with class
            query_classes = re.findall(r'querySelector\(["\']\.([^"\'.\s]+)', content)
            classes.update(query_classes)
            
            # Find querySelectorAll with class
            query_all_classes = re.findall(r'querySelectorAll\(["\']\.([^"\'.\s]+)', content)
            classes.update(query_all_classes)
            
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return classes

def extract_ids_from_js(filepath):
    """Extract ID names from JavaScript files"""
    ids = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find getElementById
            id_matches = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', content)
            ids.update(id_matches)
            
            # Find querySelector with ID
            query_ids = re.findall(r'querySelector\(["\']#([^"\'.\s]+)', content)
            ids.update(query_ids)
            
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return ids

def extract_selectors_from_css(filepath):
    """Extract all selectors from CSS file"""
    selectors = {
        'classes': set(),
        'ids': set(),
        'elements': set(),
        'pseudo': set()
    }
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Remove comments
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            
            # Find all selectors (before {)
            selector_blocks = re.findall(r'([^{}]+)\s*{', content)
            
            for block in selector_blocks:
                # Split by comma for multiple selectors
                individual_selectors = block.split(',')
                
                for selector in individual_selectors:
                    selector = selector.strip()
                    
                    # Extract classes
                    class_matches = re.findall(r'\.([a-zA-Z0-9_-]+)', selector)
                    selectors['classes'].update(class_matches)
                    
                    # Extract IDs
                    id_matches = re.findall(r'#([a-zA-Z0-9_-]+)', selector)
                    selectors['ids'].update(id_matches)
                    
                    # Extract pseudo-classes/elements
                    if '::' in selector or ':' in selector:
                        selectors['pseudo'].add(selector)
                    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    return selectors

def main():
    print("=" * 80)
    print("CSS USAGE ANALYSIS")
    print("=" * 80)
    
    # Collect all used classes and IDs
    used_classes = set()
    used_ids = set()
    
    # Analyze HTML files
    print("\n📄 Analyzing HTML files...")
    for html_file in HTML_FILES:
        if os.path.exists(html_file):
            classes = extract_classes_from_html(html_file)
            ids = extract_ids_from_html(html_file)
            used_classes.update(classes)
            used_ids.update(ids)
            print(f"  ✓ {html_file}: {len(classes)} classes, {len(ids)} IDs")
        else:
            print(f"  ✗ {html_file}: NOT FOUND")
    
    # Analyze JavaScript files
    print("\n📜 Analyzing JavaScript files...")
    for js_file in JS_FILES:
        if os.path.exists(js_file):
            classes = extract_classes_from_js(js_file)
            ids = extract_ids_from_js(js_file)
            used_classes.update(classes)
            used_ids.update(ids)
            print(f"  ✓ {js_file}: {len(classes)} classes, {len(ids)} IDs")
        else:
            print(f"  ✗ {js_file}: NOT FOUND")
    
    # Analyze CSS file
    print(f"\n🎨 Analyzing CSS file: {CSS_FILE}...")
    css_selectors = extract_selectors_from_css(CSS_FILE)
    
    # Find unused selectors
    unused_classes = css_selectors['classes'] - used_classes
    unused_ids = css_selectors['ids'] - used_ids
    
    # Results
    print("\n" + "=" * 80)
    print("RESULTS")
    print("=" * 80)
    
    print(f"\n✅ USED in HTML/JS:")
    print(f"   Classes: {len(used_classes)}")
    print(f"   IDs: {len(used_ids)}")
    
    print(f"\n📋 DEFINED in CSS:")
    print(f"   Classes: {len(css_selectors['classes'])}")
    print(f"   IDs: {len(css_selectors['ids'])}")
    
    print(f"\n❌ UNUSED (can be removed):")
    print(f"   Classes: {len(unused_classes)}")
    print(f"   IDs: {len(unused_ids)}")
    
    # Calculate potential savings
    total_css_selectors = len(css_selectors['classes']) + len(css_selectors['ids'])
    total_unused = len(unused_classes) + len(unused_ids)
    if total_css_selectors > 0:
        savings_percent = (total_unused / total_css_selectors) * 100
        print(f"\n💾 Potential savings: ~{savings_percent:.1f}% of selectors")
    
    # Save detailed report
    with open('css_analysis_report.txt', 'w', encoding='utf-8') as f:
        f.write("CSS ANALYSIS REPORT\n")
        f.write("=" * 80 + "\n\n")
        
        f.write(f"Total USED classes: {len(used_classes)}\n")
        f.write(f"Total USED IDs: {len(used_ids)}\n")
        f.write(f"Total CSS classes: {len(css_selectors['classes'])}\n")
        f.write(f"Total CSS IDs: {len(css_selectors['ids'])}\n\n")
        
        f.write("UNUSED CLASSES (can be removed):\n")
        f.write("-" * 80 + "\n")
        for cls in sorted(unused_classes):
            f.write(f"  .{cls}\n")
        
        f.write("\n\nUNUSED IDS (can be removed):\n")
        f.write("-" * 80 + "\n")
        for id_name in sorted(unused_ids):
            f.write(f"  #{id_name}\n")
        
        f.write("\n\nUSED CLASSES (must keep):\n")
        f.write("-" * 80 + "\n")
        for cls in sorted(used_classes):
            f.write(f"  .{cls}\n")
        
        f.write("\n\nUSED IDS (must keep):\n")
        f.write("-" * 80 + "\n")
        for id_name in sorted(used_ids):
            f.write(f"  #{id_name}\n")
    
    print(f"\n📊 Detailed report saved to: css_analysis_report.txt")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
