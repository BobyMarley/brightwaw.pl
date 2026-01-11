import re

INPUT_CSS = 'index.merged.css'
OUTPUT_CSS = 'restored_styles.css' # Appending to this

TARGET_SELECTORS = [
    '.zamow-btn', 
    '.land-btn', 
    '.promo-cta', 
    '.pricing-cta', 
    '.reviews-button',
    '#send', # button#send might match #send
    '.cleaning-type-btn',
    '.cleaning-tab',
    '.land-btn-white',
    '.land-btn-outline'
]

def extract_rules():
    with open(INPUT_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    restored_content = []
    
    # Simple block parser again
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
        
        # Check if this rule matches any target
        # selector_str might be ".foo, .bar"
        
        should_keep = False
        chunks = [c.strip() for c in selector_str.split(',')]
        for c in chunks:
            for t in TARGET_SELECTORS:
                # Exact match or starts with (e.g. .zamow-btn:hover)
                if t in c:
                    should_keep = True
                    break
        
        if should_keep:
            restored_content.append(full_rule)
            
        i = j
        
    with open(OUTPUT_CSS, 'a', encoding='utf-8') as f:
        f.write('\n/* RESTORED BUTTONS FROM MERGED CSS */\n')
        f.write('\n'.join(restored_content))
    
    print(f"Appended {len(restored_content)} rules to {OUTPUT_CSS}")

if __name__ == '__main__':
    extract_rules()
