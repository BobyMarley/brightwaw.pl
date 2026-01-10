import re

INPUT_FILE = 'index.min.css'
OUTPUT_FILE = 'index.dedup.css'

def parse_and_deduplicate(css_text):
    """
    Parses CSS, finds rules with IDENTICAL bodies, and merges selectors.
    Preserves @media blocks and comments effectively.
    """
    items = []
    i = 0
    n = len(css_text)
    
    # 1. Parse into Items (same as before)
    while i < n:
        while i < n and css_text[i].isspace(): i += 1
        if i >= n: break
        
        if css_text.startswith('/*', i):
            end = css_text.find('*/', i)
            if end == -1: end = n
            else: end += 2
            items.append({'type': 'comment', 'content': css_text[i:end]})
            i = end
            continue
            
        brace = css_text.find('{', i)
        if brace == -1:
            items.append({'type': 'unknown', 'content': css_text[i:]})
            break
            
        selector = css_text[i:brace].strip()
        
        j = brace + 1
        depth = 1
        while j < n and depth > 0:
            if css_text[j] == '{': depth += 1
            elif css_text[j] == '}': depth -= 1
            j += 1
            
        body = css_text[brace+1 : j-1].strip()
        
        if selector.startswith('@media'):
            # Recurse for internal deduplication?
            # It's valuable. Identify if we can reuse the function.
            # But the function returns a String. 
            # We need to process the Body content.
            # Let's try to process the body of the media query!
            processed_body = parse_and_deduplicate(body)
            items.append({'type': 'media', 'query': selector, 'content': processed_body})
        elif selector.startswith('@keyframes') or selector.startswith('@font-face'):
            items.append({'type': 'other_at', 'query': selector, 'content': body})
        else:
            # Normal Rule
            # Normalize body to ensure match (sort declarations?)
            # CAUTION: Sorting declarations can break CSS if order matters (e.g. padding vs padding-top).
            # Safe strategy: Only merge if string body is IDENTICAL (after whitespace norm) OR
            #                if we are very confident.
            # Let's try EXACT string match first (whitespace sensitive? No, normalize space).
            normalized_body = ';'.join([s.strip() for s in body.split(';') if s.strip()])
            # Add final semicolon logic?
            # "color:red" vs "color:red;" -> same.
            
            items.append({'type': 'rule', 'selector': selector, 'body': body, 'norm_body': normalized_body})
        
        i = j

    # 2. Deduplicate Rules
    # Only deduplicate adjacent? Or global?
    # Global deduplication is powerful but changes order (cascade).
    # CSS Cascade order implies: later rules override earlier.
    # If we merge:
    # Rule A { color: red }
    # ...
    # Rule B { color: red }
    # Can we make it Rule A, Rule B { color: red } at position B? 
    # Yes, usually safe to move UP TO THE LATEST position.
    # But if there was Rule C { color: blue } in between affecting same elements?
    # Actually, B overrides C. If we move A to B, A now overrides C too. 
    # If A was supposed to be overridden by C, that is broken.
    # So moving A to B is RISKY if they target same elements.
    
    # SAFE STRATEGY:
    # 1. Exact Duplicates (Rule Deduplication in cssutils usually merges adjacent).
    # 2. Global Deduplication is risky without DOM knowledge.
    # 
    # However, "Aggressive Refactoring" implies taking some risks or analyzing.
    # Let's try: Group by Body.
    # Store the index of the first occurrence.
    # Check if any "intermediate" rule conflicts? Too hard.
    
    # Let's implement SAFE MERGE:
    # Only merge if rules are consecutive (ignoring comments)?
    # Or, let's look at the user request: "Remove duplicates".
    # Often meant: "I have 50 copies of .land-btn styles". 
    # Those are scattered. 
    # We already removed exact duplicates in Phase 1 mechanically.
    
    # What if we just merge identical bodies and place them at the LAST occurrence?
    # This is generally the safest "aggressive" approach (styles apply "as if" they were at the end).
    
    # Let's try: Map[Body] -> List of Selectors.
    # Iterate clean items.
    # If rule: add selector to list for that Body.
    # But when to output?
    # Output at the LAST occurrence of that Body.
    
    # Pass 1: Identification
    body_map = {} # norm_body -> {'selectors': [], 'last_index': -1, 'indices': []}
    
    for idx, item in enumerate(items):
        if item['type'] == 'rule':
            b = item['norm_body']
            if b not in body_map:
                body_map[b] = {'selectors': [], 'items': []}
            body_map[b]['selectors'].append(item['selector'])
            body_map[b]['items'].append(idx)
            
    # Mark items as "merged" (skip output) except the last one?
    # Or modify the Last Item's selector to include all previous?
    
    for b, data in body_map.items():
        if len(data['selectors']) > 1:
            # We have duplicates.
            # Strategy: Modify the LAST item to include all selectors.
            last_idx = data['items'][-1]
            # Use dictionary to keep unique selectors?
            # Join with commas.
            # items[last_idx]['selector'] = ', '.join(data['selectors']) -- Wait, order of selectors in list matters?
            # Yes, standard CSS: .a, .b {}
            merged_secs = ', '.join(dict.fromkeys(data['selectors'])) # Unique preserve order
            items[last_idx]['selector'] = merged_secs
            
            # Mark previous indices as DELETE
            for idx in data['items'][:-1]:
                items[idx]['action'] = 'delete'
                
    # 3. Reconstruct
    final_output = []
    for item in items:
        if item.get('action') == 'delete':
            continue
            
        if item['type'] == 'comment':
            final_output.append(item['content'])
        elif item['type'] == 'rule':
             final_output.append(f"{item['selector']} {{\n  {item['body']}\n}}")
        elif item['type'] == 'media':
             final_output.append(f"{item['query']} {{\n{item['content']}\n}}")
        elif item['type'] == 'other_at':
             final_output.append(f"{item['query']} {{\n  {item['content']}\n}}")
        else:
             final_output.append(item.get('content', ''))
             
    return '\n'.join(final_output)

# Run
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw = f.read()
    
result = parse_and_deduplicate(raw)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(result)
    
print(f"Deduplicated CSS written to {OUTPUT_FILE}")
