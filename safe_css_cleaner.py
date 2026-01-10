import re

INPUT_CSS = 'index.css'
OUTPUT_CSS = 'index.clean.css'
WHITELIST_FILE = 'used_selectors.txt'

# 1. Load Whitelist
used_tokens = set()
with open(WHITELIST_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        token = line.strip()
        if token:
            used_tokens.add(token)

print(f"Loaded {len(used_tokens)} used selectors.")

# 2. Token extraction regex (matches .class or #id)
# Avoid matching inside url(), content: "", etc. by applying this only to selector string
token_re = re.compile(r'([.#]-?[_a-zA-Z]+[_a-zA-Z0-9-]*)')

def is_rule_used(selector_text):
    # If it's a keyframe definition (e.g. "0%", "from"), keep it
    if '%' in selector_text or 'from' in selector_text or 'to' in selector_text:
        return True
    
    # Extract potential classes/ids
    tokens = [t for t in token_re.findall(selector_text) if t.startswith('.') or t.startswith('#')]
    
    # If no classes/ids (only tags like 'body' 'html' '*' or attribs '[type=...]'), KEEP
    if not tokens:
        return True
    
    # Check if ANY token is in whitelist
    # Conservative strategy: Only delete if ALL classes/ids in the selector are UNKNOWN.
    # Actually, we want to remove if the *primary* subject is unused, but CSS is complex.
    # Let's try: if at least one token is in usage, keep it.
    # If NONE are in usage, it's likely dead code.
    
    for t in tokens:
        if t in used_tokens:
            return True
            
    # Helper: specific check for complex pseudo-classes or attributes?
    # If we have .btn unused, but we use .btn:hover? Whitelist should contain .btn if it's in HTML.
    # Our whitelist comes from HTML IDs/Classes + JS strings.
    
    return False

def process_css(text):
    clean_output = []
    i = 0
    length = len(text)
    
    # Stack for blocks: 'root' or 'at-rule'
    # Actually, we just need to skip blocks if their 'selector' is rejected.
    # But we only filter STYLE rules, not @media wrappers.
    
    while i < length:
        # Find next '{'
        try:
            next_brace = text.index('{', i)
        except ValueError:
            # No more blocks, append rest and break
            clean_output.append(text[i:])
            break
            
        # Capture selector (text from i to next_brace)
        selector = text[i:next_brace].strip()
        
        # Find matching '}'
        # We need to handle nested braces (e.g. inside @media)
        # Scan forward from next_brace + 1
        depth = 1
        j = next_brace + 1
        while j < length and depth > 0:
            if text[j] == '{':
                depth += 1
            elif text[j] == '}':
                depth -= 1
            j += 1
            
        # block_content includes the braces { ... }
        block_content = text[next_brace:j]
        
        # Logic:
        # 1. If selector starts with @:
        #    - @media, @supports: We should technically process INSIDE.
        #    - @keyframes, @font-face: Keep whole.
        #    - For simplicity in this script: KEEP all @-rules entirely. 
        #      (We can refine @active-task removal later if needed, but safe is better)
        if selector.startswith('@'):
            # TODO: Recursively clean inside @media? 
            # For now, let's just KEEP @media to be safe against breaking layout logic. 
            # We remove unused "leaf" styles. 
            # If we want to clean inside @media, we'd need recursion.
            # Let's try simple recursion for @media only.
            if selector.startswith('@media') or selector.startswith('@supports'):
                # Extract inner content (exclude outer braces)
                inner_body = block_content[1:-1]
                processed_inner = process_css(inner_body)
                # If inner became empty, drop the media query? 
                # Maybe strictly empty string check.
                if processed_inner.strip():
                    clean_output.append(selector + " {" + processed_inner + "}")
                else:
                    # Dropped empty media query
                    pass
            else:
                # Other @rules (keyframes, font-face, import): Keep
                clean_output.append(selector + " " + block_content)
                
        # 2. If it's a style rule
        else:
            # Check comments?
            # If selector is just a comment or empty? 
            clean_selector = re.sub(r'/\*.*?\*/', '', selector, flags=re.DOTALL).strip()
            
            if not clean_selector:
                 # Just comments or structure space, append as is? 
                 # Often comes from "}" <space> "{" gaps.
                 # If we are strictly parsing structure, "selector" captures everything before {.
                 # If it had }, we handled it in previous loop.
                 # If it is empty, it means we had "{ ... } { ... }"
                 pass
            else:
                 # Check if we keep it
                 if is_rule_used(clean_selector):
                     clean_output.append(selector + " " + block_content)
                 else:
                     # Dropping
                     # print(f"Dropping: {clean_selector}")
                     pass
        
        # Move i to j (after the closing })
        i = j
        
    return "".join(clean_output)

# Read input
with open(INPUT_CSS, 'r', encoding='utf-8') as f:
    raw_css = f.read()

# Run cleaner
cleaned_css = process_css(raw_css)

# Minify slightly (collapse multiple spaces/newlines to single)? 
# No, let's keep readability or just write as is. The user asked for clean, not minified yet.
# But output format might be weird due to join. 
# Let's ensure basic spacing.

with open(OUTPUT_CSS, 'w', encoding='utf-8') as f:
    f.write(cleaned_css)

print(f"Safe cleaning complete. Written to {OUTPUT_CSS}")
