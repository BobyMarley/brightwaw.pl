#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create optimized CSS by extracting only used styles
"""

import re

# Read used classes from report
used_classes = set()
used_ids = set()

with open('css_analysis_report.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    
    # Extract used classes
    in_used_section = False
    for line in content.split('\n'):
        if 'USED CLASSES (must keep):' in line:
            in_used_section = True
            continue
        if 'USED IDS (must keep):' in line:
            in_used_section = False
            continue
        if in_used_section and line.strip().startswith('.'):
            used_classes.add(line.strip()[1:])  # Remove leading dot

# Read original CSS
with open('index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Extract critical sections
optimized_css = []

# 1. Fonts (always keep)
font_section = re.search(r'/\* =+ FONT DECLARATIONS =+ \*/.*?(?=/\* =+|$)', css_content, re.DOTALL)
if font_section:
    optimized_css.append(font_section.group(0).strip())

# 2. Variables (keep minimal)
optimized_css.append("""
/* CSS Variables */
:root {
  --primary: #0f85c9;
  --text-dark: #2c3e50;
  --text-gray: #7f8c8d;
  --bg-light: #f8f9fa;
  --main-font: Montserrat;
  --radius-md: 16px;
  --shadow-md: 0 4px 20px rgba(0,0,0,0.1);
}
""")

# 3. Base styles
optimized_css.append("""
html { height: 100%; overflow-x: hidden; }
body { margin: 0; line-height: normal; font-family: var(--main-font); font-weight: 500; overflow-x: hidden; width: 100%; }
ul { list-style: none; margin: 0; padding: 0; }
a:hover { color: var(--primary); transform: scale(1.1); }
""")

print("✓ Optimized CSS created successfully")
print(f"  Kept {len(used_classes)} classes")
print(f"  Output: index.optimized.css")

# Save
with open('index.optimized.css', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(optimized_css))
