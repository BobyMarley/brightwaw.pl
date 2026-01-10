import re

INPUT_FILE = 'index.dedup.css'
OUTPUT_FILE = 'index.compressed.css'

def compress_css_values(css_text):
    # 1. Compress Hex Colors: #aabbcc -> #abc
    # Regex: # followed by (hex)(same)(hex)(same)(hex)(same)
    # Be careful not to match non-colors (unlikely with #)
    def hex_repl(match):
        r, r2, g, g2, b, b2 = match.groups()
        if r == r2 and g == g2 and b == b2:
            return f"#{r}{g}{b}"
        return match.group(0) # No change
        
    css_text = re.sub(r'#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])', hex_repl, css_text)

    # 2. Extract 0px, 0rem, 0em -> 0
    # Valid only if not inside calc() or strings?
    # Simple regex: " 0px" or ":0px" or "(0px"
    # Or generically: (?<=[\s:(])0(?:\.0*)?(?:px|em|rem|%|in|cm|mm|pc|pt|ex|ch|vw|vh|vmin|vmax)
    # We must ensure it is a value, not part of a class name .class0px (unlikely)
    # And preserve "0s" (time) inside transition? 
    # Safe list: px, em, rem, %?
    
    def zero_repl(match):
        # returns "0" preserving the prefix
        return match.group(1) + "0"
        
    # Pattern: (Start boundary: space, :, comma, open-paren) 0 (unit) (End boundary: space, ;, comma, close-paren)
    # Actually just replacing '0px' with '0' globally is mostly safe in CSS values.
    # We strip units only if value is exactly 0.
    
    units = ['px', 'em', 'rem', '%', 'in', 'cm', 'mm', 'pc', 'pt'] # Avoid 's', 'deg' if risky? 0deg == 0. 0s == 0s (required usually).
    
    for unit in units:
        # Avoid f-string complexity with regex braces
        pattern = r'(?<=[\s:,\(])0' + unit + r'(?=[\s;,\)\}])'
        css_text = re.sub(pattern, '0', css_text)
        
    # 3. Compress decimals: 0.5px -> .5px
    css_text = re.sub(r'(?<=[\s:,\(])0\.(\d+)(?=[\s;,\)\}]|px|em|rem|%)', r'.\1', css_text)

    # 4. Collapse whitespace (Mini-minification)
    # Remove newlines and multiple spaces
    # Be careful with strings "..."
    # Since we want a "readable but compressed" or "fully minified"? 
    # User said "Final Minification".
    # Let's remove comments (already removed?) and newlines/spaces.
    
    # Simple whitespace collapse:
    # 1. Newlines -> Space
    css_text = css_text.replace('\n', ' ')
    css_text = css_text.replace('\r', ' ')
    # 2. Multiple spaces -> Single
    css_text = re.sub(r'\s+', ' ', css_text)
    # 3. Remove space around delimiters { } ; : ,
    css_text = re.sub(r'\s*([\{\};:,])\s*', r'\1', css_text)
    
    # 4. Remove final semicolon in block
    css_text = css_text.replace(';}', '}')
    
    return css_text

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw = f.read()

compressed = compress_css_values(raw)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(compressed)

print(f"Compressed CSS written to {OUTPUT_FILE}")
