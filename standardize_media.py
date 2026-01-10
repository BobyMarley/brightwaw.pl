import re

INPUT_FILE = 'index.media.css'
OUTPUT_FILE = 'index.standardized.css'

# Pattern to capture @media block: @media ... { BODY }
# Note: This regex is simple and assumes balanced braces are handled by logic or regex limit.
# The previous script `consolidate_media.py` ALREADY grouped them.
# This script is about PARSING the queries and merging logically identical ones.

def clean_query(q):
    """Normalize query string: remove extra spaces, standardize syntax."""
    # Remove 'screen and' if it's redundant? Keep for safety.
    # Uniform spacing:
    q = ' '.join(q.split())
    # Handle optional 'screen and' vs just '(...)'
    # Map:
    # "@media (max-width: 640px)" -> "@media screen and (max-width: 640px)" ?
    # Actually, let's keep it simple: just space normalization.
    return q

def standardize_breakpoints(css_text):
    # Retrieve blocks from `consolidate_media.py` approach again?
    # Yes, parsing blocks is needed.
    
    # 1. Parse into items
    # (Reuse logic from consolidate_media.py in a simplified way)
    pass # See full implementation below

# Since we already ran consolidate_media.py, the file has Root rules first, then Media rules.
# We can read the file, splitting by @media.

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find where media queries start (heuristic: first @media)
# Or better: Parse accurately. 

# Let's perform a Text Replacement strategy for Standardization of known duplicates
# based on the analysis output:
# 1. `@media (max-width: 640px)` vs `@media screen and (max-width: 640px)`
# 2. `@media (max-width: 400px)` vs `@media screen and (max-width: 400px)`
# 3. `@media screen and (min-width:1300px)` vs `@media screen and (min-width: 1300px)` (space issue)

# Dictionary of TARGET replacements
replacements = {
    r'@media\s+\(max-width:\s*640px\)': '@media screen and (max-width: 640px)',
    r'@media\s+\(max-width:\s*400px\)': '@media screen and (max-width: 400px)',
    r'@media\s+\(min-width:\s*768px\)': '@media screen and (min-width: 768px)',
    # Fix missing space
    r'min-width:1300px': 'min-width: 1300px',
    # Merge 1301 to 1300? 
    # Analysis showed: min-width: 1301px AND min-width: 1300px.
    # 1300 is standard desktop? Let's map 1301 -> 1300.
    r'min-width:\s*1301px': 'min-width: 1300px'
}

new_content = content

for pattern, replacement in replacements.items():
    # Use regex sub
    new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)

# Now that we normalized names, we need to Re-Consolidate (merge the bodies of the now-identical queries).
# We can re-use `consolidate_media.py` logic! 
# Let's import it or re-write it here.

def parse_and_consolidate(text):
    # ... (Same logic as consolidate_media.py) ...
    # Simplified re-implementation inline
    items = []
    i = 0
    n = len(text)
    
    while i < n:
        while i < n and text[i].isspace(): i += 1
        if i >= n: break
        
        if text.startswith('/*', i):
            end = text.find('*/', i)
            if end == -1: end = n
            else: end += 2
            items.append({'type': 'comment', 'content': text[i:end]})
            i = end
            continue
            
        brace = text.find('{', i)
        if brace == -1:
            items.append({'type': 'unknown', 'content': text[i:]})
            break
            
        selector = text[i:brace].strip()
        
        j = brace + 1
        depth = 1
        while j < n and depth > 0:
            if text[j] == '{': depth += 1
            elif text[j] == '}': depth -= 1
            j += 1
            
        body = text[brace+1 : j-1].strip()
        
        if selector.startswith('@media'):
            # Normalize selector spaces
            selector = ' '.join(selector.split())
            items.append({'type': 'media', 'query': selector, 'content': body})
        elif selector.startswith('@keyframes') or selector.startswith('@font-face'):
            items.append({'type': 'other_at', 'query': selector, 'content': body})
        else:
            items.append({'type': 'rule', 'selector': selector, 'body': body})
        
        i = j

    # Concatenate
    root_ops = []
    media_map = {}
    media_order = []
    
    for item in items:
        if item['type'] == 'media':
            q = item['query']
            if q not in media_map:
                media_map[q] = []
                media_order.append(q)
            media_map[q].append(item['content'])
        else:
            root_ops.append(item)
            
    final_parts = []
    for item in root_ops:
        if item['type'] == 'comment': final_parts.append(item['content'])
        elif item['type'] == 'rule': final_parts.append(f"{item['selector']} {{\n  {item['body']}\n}}")
        elif item['type'] == 'other_at': final_parts.append(f"{item['query']} {{\n  {item['content']}\n}}")
        else: final_parts.append(item.get('content',''))
        
    for q in media_order:
        merged_body = '\n'.join(media_map[q])
        final_parts.append(f"\n{q} {{\n{merged_body}\n}}")
        
    return '\n'.join(final_parts)

final_output = parse_and_consolidate(new_content)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(final_output)

print(f"Standardized and re-consolidated CSS written to {OUTPUT_FILE}")
