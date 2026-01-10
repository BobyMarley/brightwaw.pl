import re, os, glob

WHITELIST_PATH = r'd:\\work\\2025\\bright\\www\\used_selectors.txt'
HTML_GLOB = r'd:\\work\\2025\\bright\\www\\*.html'

# Load existing whitelist
if os.path.exists(WHITELIST_PATH):
    with open(WHITELIST_PATH, encoding='utf-8') as f:
        whitelist = set(line.strip() for line in f if line.strip())
else:
    whitelist = set()

# Regex to capture class and id attributes
attr_regex = re.compile(r'(class|id)="([^"]+)"')

for html_path in glob.glob(HTML_GLOB):
    with open(html_path, encoding='utf-8') as f:
        content = f.read()
    for match in attr_regex.finditer(content):
        attr_type, attr_value = match.groups()
        for name in attr_value.split():
            selector = '.' + name if attr_type == 'class' else '#' + name
            whitelist.add(selector)

# Write back extended whitelist
with open(WHITELIST_PATH, 'w', encoding='utf-8') as f:
    for sel in sorted(whitelist):
        f.write(sel + '\n')
print(f'Extended whitelist written with {len(whitelist)} selectors')
