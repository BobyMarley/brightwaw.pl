import re

INPUT_FILE = 'index.purged.css'
OUTPUT_FILE = 'index.min.css'

def minify():
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {INPUT_FILE} not found. Running safe_purge first?")
        return

    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Remove whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([\{\};:,])\s*', r'\1', content)
    
    # Zero units (0px -> 0)
    content = re.sub(r'(?<=[:\s])0(?:px|em|rem|%)(?![\d\.])', '0', content)
    
    # Shorten 6-digit hex
    content = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', content)
    
    content = content.replace(';}', '}')
    content = content.strip()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Minified {INPUT_FILE} -> {OUTPUT_FILE}")
    import os
    print(f"Original size: {os.path.getsize(INPUT_FILE)}")
    print(f"Minified size: {os.path.getsize(OUTPUT_FILE)}")

if __name__ == '__main__':
    minify()
