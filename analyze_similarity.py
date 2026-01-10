import re
from collections import defaultdict
import difflib

INPUT_FILE = 'index.min.css' # Check min (deduped/standardized)
REPORT_FILE = 'similarity_report.txt'

def parse_rules(css_text):
    """
    Parses CSS into a list of (selector, body) tuples.
    Flatten @media for simplicity (prefix selector with media query?)
    """
    # Simple parser again
    items = []
    i = 0
    n = len(css_text)
    
    while i < n:
        while i < n and css_text[i].isspace(): i += 1
        if i >= n: break
        
        # Skip comments
        if css_text.startswith('/*', i):
            end = css_text.find('*/', i)
            if end == -1: end = n
            else: end += 2
            i = end
            continue
            
        brace = css_text.find('{', i)
        if brace == -1: break
        
        selector = css_text[i:brace].strip()
        
        j = brace + 1
        depth = 1
        while j < n and depth > 0:
            if css_text[j] == '{': depth += 1
            elif css_text[j] == '}': depth -= 1
            j += 1
        
        # Body content
        body = css_text[brace+1 : j-1].strip()
        
        if selector.startswith('@media'):
            # Recurse? Or just skip body analysis for media wrapper, but analyze inner rules?
            # It's better to analyze Inner rules, prefixing selector with "[Media] ".
            inner_items = parse_rules(body)
            for s, b in inner_items:
                items.append(( f"{selector} >> {s}", b ))
        elif selector.startswith('@'):
            pass # Skip keyframes etc for now
        else:
            items.append((selector, body))
        
        i = j
    return items

def analyze_similarity(items):
    # Sort declarations within body to normalize
    # "color:red; margin:0" == "margin:0; color:red"
    normalized_items = []
    for sel, body in items:
        # Split by ;
        decls = [d.strip() for d in body.split(';') if d.strip()]
        decls.sort()
        normalized_body = ';'.join(decls)
        normalized_items.append({'sel': sel, 'body': normalized_body, 'decls': set(decls)})
        
    n = len(normalized_items)
    similar_groups = []
    
    # Compare O(N^2) - risky for 3000 rules?
    # 3000^2 = 9 million. Doable in seconds for simple strings.
    # Optimization: Bucket by number of properties?
    
    # Let's target: Rules that differ by 1 property? Or share >80%?
    
    print(f"Analyzing {n} rules...")
    
    # We will compute Jaccard index of properties set
    
    # visited = set()
    
    for i in range(n):
        item1 = normalized_items[i]
        set1 = item1['decls']
        if len(set1) < 2: continue # Ignore 1-prop rules (too many generic matches)
        
        matches = []
        for j in range(i+1, n):
            item2 = normalized_items[j]
            set2 = item2['decls']
            if len(set2) < 2: continue
            
            # Intersection / Union
            intersection = len(set1.intersection(set2))
            union = len(set1.union(set2))
            
            if union == 0: continue
            similarity = intersection / union
            
            if similarity >= 0.8: # Threshold 80%
                matches.append((item2['sel'], similarity))
        
        if matches:
            # Sort by sim
            matches.sort(key=lambda x: x[1], reverse=True)
            similar_groups.append({
                'base': item1['sel'],
                'base_props': item1['body'],
                'matches': matches
            })
            
    return similar_groups

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw = f.read()

items = parse_rules(raw)
groups = analyze_similarity(items)

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write(f"Similarity Report (Threshold 80%)\nTotal Rules: {len(items)}\n\n")
    for g in groups:
        f.write(f"Rule: {g['base']}\n")
        f.write(f"Props: {g['base_props'][:100]}...\n")
        f.write("Similar to:\n")
        for m_sel, sim in g['matches']:
            f.write(f"  - {m_sel} ({int(sim*100)}%)\n")
        f.write("-" * 40 + "\n")
        
print(f"Analysis complete. Found {len(groups)} similar groups. Written to {REPORT_FILE}")
