import re

INPUT_FILE = 'index.css'
OUTPUT_FILE = 'index.min.css'

def minify_css():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Collapse whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([\{\};:,])\s*', r'\1', content)
    content = content.replace(';}', '}')
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Minified {INPUT_FILE} -> {OUTPUT_FILE}")

if __name__ == '__main__':
    minify_css()
