import cssutils, re, os

INPUT = r'd:\\work\\2025\\bright\\www\\index.css.work'
OUTPUT = r'd:\\work\\2025\\bright\\www\\index.clean.css'
WHITELIST = r'd:\\work\\2025\\bright\\www\\used_selectors.txt'

# Load whitelist
with open(WHITELIST, encoding='utf-8') as f:
    allowed = set(line.strip() for line in f if line.strip())

parser = cssutils.CSSParser()
sheet = parser.parseFile(INPUT)

def selector_used(selector):
    parts = re.split(r'[ >+~]', selector)
    for part in parts:
        part = part.strip()
        if part.startswith('.') or part.startswith('#'):
            if part in allowed:
                return True
        else:
            # element selector – keep (e.g., body, h1)
            return True
    return False

new_rules = []
for rule in sheet.cssRules:
    if rule.type == rule.STYLE_RULE:
        selectors = [s.strip() for s in rule.selectorText.split(',')]
        kept = [s for s in selectors if selector_used(s)]
        if kept:
            rule.selectorText = ', '.join(kept)
            new_rules.append(rule)
    else:
        new_rules.append(rule)

with open(OUTPUT, 'w', encoding='utf-8') as f:
    for r in new_rules:
        f.write(r.cssText + '\n')
print(f'Clean CSS written: {OUTPUT}, rules kept: {len(new_rules)}')
