import re

INPUT_FILE = 'index.min.css'
OUTPUT_FILE = 'index.merged.css'

# Defined Merge Pairs (Target <- Source)
# We will keep Target's body (or merged body) and append Source's selector to Target.
# Then remove Source rule.
# For simplicity, we assume we keep the "Base" rule properties and just add the selector.
# (Since similarity is high, the difference is negligible or we accept the "Base" style as canonical).

MERGE_MAP = {
    # Target (Canonical) : [List of duplicates to merge into it]
    '.ref-faq-title': ['.faq-title'],
    '.ref-faq-subtitle': ['.faq-subtitle'],
    '.ref-faq-question-text': ['.faq-question-text'],
    '.ref-faq-answer': ['.faq-answer'],
    '.section-title': ['.what_cleaning h2'],
    '.benefits-container': ['.advantages-container'],
    '.payment-icons': ['.equipment-logos']
}

def parse_and_merge(css_text):
    # We need a robust parser again because we are modifying specific selectors.
    # Reuse simple parser structure.
    
    items = []
    i = 0
    n = len(css_text)
    
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
            # Handling inside media queries?
            # The duplicates might be inside media queries too.
            # For now, let's process top-level or recurse.
            # Recursion is best.
            merged_inner = parse_and_merge(body)
            items.append({'type': 'media', 'query': selector, 'content': merged_inner})
            
        elif selector.startswith('@'):
            items.append({'type': 'other_at', 'query': selector, 'content': body})
        else:
            items.append({'type': 'rule', 'selector': selector, 'body': body})
        
        i = j

    # Now Processing Merges
    # Strategy:
    # 1. Index all rules by Selector.
    # 2. Iterate. If selector is in MERGE_MAP values (Source), mark delete.
    # 3. If selector is in MERGE_MAP keys (Target), append Source selectors.
    
    # Limitation: This simple lookup doesn't handle ".classA, .classB" well.
    # We assume exact match or simple splitting.
    
    # First pass: Find locations
    # target_indices = { target_sel: index }
    # source_indices = { source_sel: index }
    
    # We need to handle comma-separated selectors in CSS too.
    
    # Let's simplify: Iterate items. 
    # If item['selector'] contains any of our Targets, we modify it.
    # If item['selector'] contains any of our Sources, we remove that part (or whole rule).
    
    # Inverted map: Source -> Target
    source_to_target = {}
    for t, sources in MERGE_MAP.items():
        for s in sources:
            source_to_target[s] = t
            
    # Process items
    final_items = []
    
    # We need to find Targets first to ensure they exist?
    # Or just iterate.
    
    # Step 1: Mark deletions and Collect merge tasks
    # But we need to know WHERE the target is to append.
    
    # Let's look up index of rules matching strictly.
    # If a rule is ".faq-title", we want to remove it and tell ".ref-faq-title" to add ".faq-title".
    
    rules_by_selector = {} # selector -> list of item indices
    
    for idx, item in enumerate(items):
        if item['type'] == 'rule':
            # Split selector by comma
            parts = [p.strip() for p in item['selector'].split(',')]
            for p in parts:
                if p not in rules_by_selector:
                    rules_by_selector[p] = []
                rules_by_selector[p].append(idx)
                
    # Step 2: deletions
    # For each Source in MERGE_MAP:
    #   Find rules containing Source.
    #   Remove Source from their selector list.
    #   If selector list empty, mark rule deleted.
    #   Add Source to Target's selector list.
    
    # To do this, we need mutable representations.
    # Modifying items in place.
    
    for idx, item in enumerate(items):
        if item['type'] == 'rule':
            item['sel_parts'] = [p.strip() for p in item['selector'].split(',')]
            
    # Execute Merges
    for target, sources in MERGE_MAP.items():
        # Find Target rules
        # Could be multiple? (e.g. redefined). Usually append to ALL or LAST?
        # Appending to ALL occurrences is safe for consistent styling.
        
        target_idxs = rules_by_selector.get(target, [])
        if not target_idxs:
            # Target not found? Maybe it's inside media query (handled by recursion)
            # Or maybe we missed it.
            continue
            
        for s in sources:
            # Find rules with Source
            source_idxs = rules_by_selector.get(s, [])
            for s_idx in source_idxs:
                # Remove s from item
                # items[s_idx]['sel_parts'].remove(s) -- dangerous if duplicates
                # Filter out
                items[s_idx]['sel_parts'] = [x for x in items[s_idx]['sel_parts'] if x != s]
                
            # Add s to Target rules
            for t_idx in target_idxs:
                if s not in items[t_idx]['sel_parts']:
                     items[t_idx]['sel_parts'].append(s)
                     
    # Reconstruct string
    # Recursive reconstruction for media queries handled by return string.
    
    output_str = []
    
    for item in items:
        if item['type'] == 'media':
            # Just append (content already recursively processed if we change signature)
            # Wait, our recursion was: merged_inner = parse_and_merge(body)
            # So item['content'] IS the merged string. Good.
            output_str.append(f"{item['query']} {{\n{item['content']}\n}}")
        elif item['type'] == 'rule':
            if item['sel_parts']:
                new_sel = ', '.join(item['sel_parts'])
                output_str.append(f"{new_sel} {{\n  {item['body']}\n}}")
            else:
                 # Empty selector (all parts merged away) -> Delete rule
                 pass
        elif item['type'] == 'other_at':
             output_str.append(f"{item['query']} {{\n  {item['content']}\n}}")
        elif item['type'] == 'comment':
             output_str.append(item['content'])
        else:
             output_str.append(item.get('content',''))
             
    return '\n'.join(output_str)

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw = f.read()
    
result = parse_and_merge(raw)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(result)
    
print(f"Merged CSS rule pairs. Written to {OUTPUT_FILE}")
