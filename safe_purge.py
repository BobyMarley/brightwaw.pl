import re
import os

CSS_FILE = 'index.css'
OUTPUT_FILE = 'index.purged.css'

# Whitelist patterns
WHITELIST_PATTERNS = [
    r'land-', r'btn-', r'fa-',    "modal-active", "active", "show", "open", "scrolled",
    "card", "card-content", "cards-input", "price", "price-value", "cleaning-tab", "cleaning-content", "btn", "primary", "outline",
    "service-card", "pricing-card", "district-badge", "promo-box",
    "icon-3d", "benefit-card-3d", "icon-gift", "icon-money", "icon-bolt",
    r'cookie', r'success', r'error', r'form', r'input',
    r'room-', r'cleaning-', r'table'
]

SCAN_EXTENSIONS = ['.html', '.js']
IGNORE_DIRS = {'.git', '.gemini', 'brain', 'node_modules', '__pycache__', 'backup_safety_v3', '1'}

def get_used_selectors():
    used = set()
    for root, dirs, files in os.walk('.'):
        # Exclude ignored dirs
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in SCAN_EXTENSIONS):
                path = os.path.join(root, file)
                # print(f"Scanning {path}...")
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        tokens = re.findall(r'[a-zA-Z0-9_-]+', content)
                        used.update(tokens)
                except Exception as e:
                    print(f"Error scanning {path}: {e}")
    return used

def is_used(selector, used_tokens):
    clean_selector = re.sub(r'[>+~:,\[\]=]', ' ', selector)
    parts = clean_selector.split()
    for part in parts:
        name = part.lstrip('.#')
        if not name: continue
        if any(p in name for p in WHITELIST_PATTERNS): return True
        if part[0] not in '.#': continue 
        if name in used_tokens: return True
    if not any(c in selector for c in '.#'): return True
    return False

def purge_css():
    print("Starting Safe Purge...")
    try:
        used_tokens = get_used_selectors()
        print(f"Found {len(used_tokens)} unique tokens in project.")
        
        with open(CSS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        new_rules = []
        removed_count = 0
        total_rules = 0
        
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
            total_rules += 1
            
            if selector_str.startswith('@'):
                new_rules.append(full_rule)
            else:
                selectors = selector_str.split(',')
                keep_rule = False
                for s in selectors:
                    if is_used(s.strip(), used_tokens):
                        keep_rule = True
                        break
                if keep_rule:
                    new_rules.append(full_rule)
                else:
                    removed_count += 1
            i = j
            
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(''.join(new_rules))
            
        print(f"Purge complete. Rules: {total_rules} -> {len(new_rules)} (Removed {removed_count}).")
        print(f"Output saved to {OUTPUT_FILE}")
    except Exception as e:
        print(f"Purge failed: {e}")

if __name__ == '__main__':
    purge_css()
