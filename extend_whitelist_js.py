import re, os, glob

WHITELIST_PATH = r'd:\\work\\2025\\bright\\www\\used_selectors.txt'
JS_GLOB = r'd:\\work\\2025\\bright\\www\\*.js'

# Load existing whitelist
if os.path.exists(WHITELIST_PATH):
    with open(WHITELIST_PATH, encoding='utf-8') as f:
        whitelist = set(line.strip() for line in f if line.strip())
else:
    whitelist = set()

# Regex to capture class and id strings in JS (simple heuristic)
# Looks for patterns like "className = 'foo'", "classList.add('foo')", "#foo" etc.
pattern = re.compile(r"['\"]([a-zA-Z0-9_-]+)['\"]")

for js_path in glob.glob(JS_GLOB):
    with open(js_path, encoding='utf-8') as f:
        content = f.read()
    for match in pattern.finditer(content):
        name = match.group(1)
        # Heuristic: if name starts with a digit, skip (unlikely class/ID)
        if name[0].isdigit():
            continue
        # Add as class selector (most JS strings refer to classes)
        whitelist.add('.' + name)
        # Also add as ID selector if it appears with a leading '#'
        if name.startswith('#'):
            whitelist.add('#' + name.lstrip('#'))

# Write back extended whitelist
with open(WHITELIST_PATH, 'w', encoding='utf-8') as f:
    for sel in sorted(whitelist):
        f.write(sel + '\n')
print(f'Extended whitelist with JS selectors, total {len(whitelist)} selectors')
