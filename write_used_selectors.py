import re, os

analysis_path = r'd:\\work\\2025\\bright\\www\\deep_css_analysis.txt'
whitelist_path = r'd:\\work\\2025\\bright\\www\\used_selectors.txt'

selectors = set()
with open(analysis_path, encoding='utf-8') as f:
    for line in f:
        m = re.match(r'\s*([.#][\w-]+)', line)
        if m:
            selectors.add(m.group(1))

with open(whitelist_path, 'w', encoding='utf-8') as f:
    for sel in sorted(selectors):
        f.write(sel + '\n')
print(f'Whitelist written: {len(selectors)} selectors')
