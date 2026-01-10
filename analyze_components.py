import re
import glob

CSS_FILE = 'index.min.css'
HTML_GLOB = '*.html'

# Regex patterns
RULE_REGEX = re.compile(r'([^{]+)\{([^}]+)\}')
PROP_REGEX = re.compile(r'([-\w]+)\s*:\s*([^;]+)')

def parse_css(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    rules = []
    # Simple parser assuming compressed format (no internal braces for @media logic here for simplicity, 
    # but index.min.css might have them. We need to be careful).
    # Since we reused the previous parser logic effectively, let's reuse that Structure.
    
    # Actually, for "Component Analysis", we care about classes that share property KEYS mostly.
    # e.g. .card, .service-card both have padding, border-radius, box-shadow.
    
    # Let's use a simpler heuristic:
    # 1. Extract all selectors and their bodies.
    # 2. Extract properties.
    # 3. Cluster by "Archetype":
    #    - Cards: border-radius, box-shadow, background
    #    - Buttons: padding, border-radius, cursor, background
    #    - Typography: font-size, font-weight, color
    #    - Layout: display: flex/grid, gap, margin
    
    pass
    return rules

def analyze_components():
    # 1. Read CSS
    with open(CSS_FILE, 'r', encoding='utf-8') as f:
        css = f.read()

    # Naive split by "}" to get rules
    raw_rules = css.split('}')
    
    archetypes = {
        'Card': [],
        'Button': [],
        'Typography': [],
        'Layout': [],
        'Other': []
    }
    
    for r in raw_rules:
        if '{' not in r: continue
        parts = r.split('{')
        selector = parts[0].strip()
        body = parts[1].strip()
        
        # Heuristic Classification
        lower_sel = selector.lower()
        lower_body = body.lower()
        
        props = [p.split(':')[0].strip() for p in body.split(';') if ':' in p]
        
        # Classification Logic
        is_card = ('shadow' in lower_body or 'border' in lower_body) and ('radius' in lower_body) and ('padding' in lower_body)
        is_btn = ('cursor' in lower_body) and ('background' in lower_body) and ('padding' in lower_body) and ('.btn' in lower_sel or 'button' in lower_sel or 'cta' in lower_sel)
        is_tipo = ('font-' in lower_body) or ('text-' in lower_body) or ('color' in lower_body and len(props) < 5)
        is_layout = ('display' in lower_body) or ('grid' in lower_body) or ('flex' in lower_body) or ('margin' in lower_body and 'padding' not in lower_body)
        
        item = {'sel': selector, 'body': body, 'props': props}
        
        if is_btn: archetypes['Button'].append(item)
        elif is_card: archetypes['Card'].append(item)
        elif is_layout: archetypes['Layout'].append(item)
        elif is_tipo: archetypes['Typography'].append(item)
        else: archetypes['Other'].append(item)

    # Generate Report
    with open('component_report.txt', 'w', encoding='utf-8') as f:
        for arch, items in archetypes.items():
            f.write(f"=== {arch} Candidates ({len(items)}) ===\n")
            # Group by "Likely Duplicate" (Similar Property Sets)
            # We can't do deep comparison script here easily, just listing for visual scan by Agent.
            
            # Sort by body length
            items.sort(key=lambda x: len(x['body']), reverse=True)
            
            for item in items[:20]: # Top 20 most complex
                f.write(f"  {item['sel']}\n    {item['body'][:80]}...\n")
            f.write("\n")

if __name__ == '__main__':
    analyze_components()
