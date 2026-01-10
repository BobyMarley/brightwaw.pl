import re

INPUT_FILE = 'index.clean.css'
OUTPUT_FILE = 'index.media.css'

def parse_css_blocks(css_text):
    """
    Parses CSS into a list of items.
    Item: {'type': 'rule', 'selector': str, 'body': str} 
          OR {'type': 'media', 'query': str, 'content': str}
          OR {'type': 'comment', 'content': str}
    """
    items = []
    i = 0
    n = len(css_text)
    
    while i < n:
        # Skip whitespace
        while i < n and css_text[i].isspace():
            i += 1
        if i >= n: break
        
        # Check for comment
        if css_text.startswith('/*', i):
            end = css_text.find('*/', i)
            if end == -1: end = n
            else: end += 2
            items.append({'type': 'comment', 'content': css_text[i:end]})
            i = end
            continue
            
        # Parse Selector or @-rule
        brace_start = css_text.find('{', i)
        if brace_start == -1: 
            # No more blocks
            rest = css_text[i:].strip()
            if rest: items.append({'type': 'unknown', 'content': rest})
            break
            
        selector = css_text[i:brace_start].strip()
        
        # Find matching brace
        j = brace_start + 1
        depth = 1
        while j < n and depth > 0:
            if css_text[j] == '{': depth += 1
            elif css_text[j] == '}': depth -= 1
            j += 1
            
        body = css_text[brace_start+1 : j-1].strip() # Content inside {}
        
        if selector.startswith('@media'):
            items.append({'type': 'media', 'query': selector, 'content': body})
        elif selector.startswith('@keyframes') or selector.startswith('@font-face'):
            # Treat as opaque block, don't consolidate body
            items.append({'type': 'other_at', 'query': selector, 'content': body})
        else:
            items.append({'type': 'rule', 'selector': selector, 'body': body})
            
        i = j
        
    return items

def consolidate_css(items):
    """
    Consolidates items:
    1. Roots rules are kept in order.
    2. Identical @media blocks are merged.
    """
    
    # We want to group @media blocks at the END or keep them relative?
    # Standard practice: Mobile first, media queries often at bottom or after rules.
    # Current CSS likely has them scattered.
    # Approach:
    # - Pass 1: Collect all Root rules and Comment blocks in order.
    # - Pass 2: Collect all Media blocks, grouped by Query.
    
    root_ops = []
    media_map = {} # query -> list of bodies
    media_order = [] # list of queries to preserve order of first appearance
    
    for item in items:
        if item['type'] == 'media':
            q = item['query']
            # Normalize whitespace in query
            q_norm = ' '.join(q.split())
            if q_norm not in media_map:
                media_map[q_norm] = []
                media_order.append(q_norm)
            media_map[q_norm].append(item['content'])
            
        else:
            # Rules, comments, other @rules
            # Just append to root
            root_ops.append(item)

    # Reconstruct
    final_parts = []
    
    # 1. Root items
    for item in root_ops:
        if item['type'] == 'comment':
            final_parts.append(item['content'])
        elif item['type'] == 'rule':
             final_parts.append(f"{item['selector']} {{\n  {item['body']}\n}}")
        elif item['type'] == 'other_at':
             final_parts.append(f"{item['query']} {{\n  {item['content']}\n}}")
        else:
             final_parts.append(item.get('content', ''))
             
    # 2. Media items
    for q in media_order:
        bodies = media_map[q]
        # Merge bodies? 
        # Media content is essentially a mini-CSS. 
        # Ideally we parse it too, but let's just concatenate for safety first.
        # Concatenation of bodies: "rule { ... } rule2 { ... }" is valid.
        merged_body = '\n'.join(bodies)
        final_parts.append(f"\n{q} {{\n{merged_body}\n}}")
        
    return '\n'.join(final_parts)

print(f"Reading {INPUT_FILE}...")
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw = f.read()

print("Parsing...")
parsed_items = parse_css_blocks(raw)
print(f"Found {len(parsed_items)} clean blocks.")

print("Consolidating...")
final_css = consolidate_css(parsed_items)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(final_css)

print(f"Written consolidated CSS to {OUTPUT_FILE}")
