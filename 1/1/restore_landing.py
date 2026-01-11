import re

INPUT_CSS = 'index.merged.css'
OUTPUT_CSS = 'restored_styles.css' # Appending

def extract_landing_styles():
    with open(INPUT_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    restored_count = 0
    restored_rules = []
    
    # We want ANY rule where selector contains ".land-"
    
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
        
        if ".land-" in selector_str:
            # Check if likely media query wrapper?
            # My simple parser assumes top level.
            # If selector starts with @media, we might miss it if we don't look inside.
            # But normally .land- classes define the structure.
            restored_rules.append(full_rule)
            restored_count += 1
            
        i = j

    if restored_rules:
        with open(OUTPUT_CSS, 'a', encoding='utf-8') as f:
            f.write('\n/* RESTORED LANDING STYLES (Phase 7 Rescue) */\n')
            f.write('\n'.join(restored_rules))
            
    print(f"Rescued {restored_count} .land-* rules from {INPUT_CSS}")

if __name__ == '__main__':
    extract_landing_styles()
