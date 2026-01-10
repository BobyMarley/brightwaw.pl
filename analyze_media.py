import re
from collections import Counter

css_file = 'index.clean.css'

with open(css_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Match @media ... {
# Note: This simple regex catches the opening line. 
# Robust parsing would need a full parser, but effectively we want to see duplication.
media_pattern = re.compile(r'(@media[^{]+)\{')

matches = media_pattern.findall(content)
# Clean up whitespace
matches = [m.strip() for m in matches]

counter = Counter(matches)

print(f"Total media query blocks: {len(matches)}")
print(f"Unique media queries: {len(counter)}")
print("-" * 40)
print(f"{'Count':<6} | {'Query'}")
print("-" * 40)
for query, count in counter.most_common():
    print(f"{count:<6} | {query}")
