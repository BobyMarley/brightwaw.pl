# Append missing selectors that were stripped
whitelist_path = r'd:\\work\\2025\\bright\\www\\used_selectors.txt'
missing = [
    '.btn-cta-primary',
    '.btn-cta-primary:hover',
    '.btn-cta-primary:focus',
    '.btn-cta-outline',
    '.btn-cta-outline:hover',
    '.btn-cta-outline:focus',
    '.calculator-section',
    '.calculator-container',
    '.calculator-card',
    '.cleaning-type-btn',
    '.cleaning-type-btn:hover',
    '.cleaning-type-heading',
    '.cleaning-type-heading:hover',
    '.cleaning-type-heading:focus',
    '.cleaning-type-btn.active',
]
# Load existing whitelist
with open(whitelist_path, 'r', encoding='utf-8') as f:
    whitelist = set(line.strip() for line in f if line.strip())
# Add missing
whitelist.update(missing)
# Write back
with open(whitelist_path, 'w', encoding='utf-8') as f:
    for sel in sorted(whitelist):
        f.write(sel + '\n')
print('Added missing selectors, total now', len(whitelist))
