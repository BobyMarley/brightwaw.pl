import re, os

INPUT = r'd:\\work\\2025\\bright\\www\\index.css'
OUTPUT = r'd:\\work\\2025\\bright\\www\\index.min.css'

def minify_css(css):
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    # Remove whitespace around symbols
    css = re.sub(r'\s*([{}:;,])\s*', r'\1', css)
    # Collapse multiple spaces
    css = re.sub(r'\s+', ' ', css)
    # Remove leading/trailing spaces
    css = css.strip()
    return css

if __name__ == '__main__':
    with open(INPUT, 'r', encoding='utf-8') as f:
        content = f.read()
    minified = minify_css(content)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write(minified)
    print(f"Minified CSS written to {OUTPUT}, original size: {os.path.getsize(INPUT)} bytes, minified size: {os.path.getsize(OUTPUT)} bytes")
