import re

INPUT_CSS = 'index.css' # The ORIGINAL file
OUTPUT_CSS = 'restored_landing_full.css'

TARGETS = [
    '.land-',
    '#uslugi',
    '.text-gray' # Helper often used in landing
]

def extract_from_original():
    with open(INPUT_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    rules = []
    i = 0
    n = len(content)
    
    while i < n:
        brace = content.find('{', i)
        if brace == -1: break
        
        selector_str = content[i:brace].strip()
        
        j = brace + 1
        depth = 1
        while j < n and depth > 0:
            if content[j] == '{': depth += 1
            elif content[j] == '}': depth -= 1
            j += 1
        
        full_rule = content[i:j]
        
        # Check against targets
        # Be loose: if any target string is in selector
        matched = False
        for t in TARGETS:
            if t in selector_str:
                matched = True
                break
        
        if matched:
            rules.append(full_rule)
            
        i = j
        
    with open(OUTPUT_CSS, 'w', encoding='utf-8') as f:
        f.write('/* RESTORED FROM ORIGINAL INDEX.CSS */\n')
        f.write('\n'.join(rules))
        
    print(f"Extracted {len(rules)} rules from {INPUT_CSS}")

if __name__ == '__main__':
    extract_from_original()
