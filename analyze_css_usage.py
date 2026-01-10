import re
import os

# Configuration
css_file_path = r'd:\work\2025\bright\www\index.css'
search_files = [
    r'd:\work\2025\bright\www\index.html',
    r'd:\work\2025\bright\www\cennik.html',
    r'd:\work\2025\bright\www\sprzatanie-mieszkan-warszawa.html',
    r'd:\work\2025\bright\www\form.js',
    r'd:\work\2025\bright\www\modal.js',
    r'd:\work\2025\bright\www\vanilla-app.js',
    r'd:\work\2025\bright\www\data.js'
]

def get_css_selectors(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very basic regex to capture class names in selectors
    # Matches .className followed by various selector chars or opening brace
    # This is a heuristic, not a full CSS parser
    class_pattern = re.compile(r'\.([a-zA-Z0-9_-]+)(?=[^}]*\{)')
    classes = set(class_pattern.findall(content))
    return classes, content

def scan_files_for_tokens(files):
    tokens = set()
    for file_path in files:
        if not os.path.exists(file_path):
            print(f"Warning: File not found {file_path}")
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Tokenize by splitting on anything that isn't a word char or hyphen
            # This captures specific class names like 'btn-primary'
            words = set(re.split(r'[^a-zA-Z0-9_-]+', content))
            tokens.update(words)
    return tokens

def main():
    print(f"Analyzing {css_file_path}...")
    defined_classes, css_content = get_css_selectors(css_file_path)
    print(f"Found {len(defined_classes)} unique class selectors in CSS.")
    
    used_tokens = scan_files_for_tokens(search_files)
    print(f"Found {len(used_tokens)} unique tokens in HTML/JS files.")
    
    unused_classes = []
    for cls in defined_classes:
        if cls not in used_tokens:
            unused_classes.append(cls)
            
    print(f"Potential unused classes: {len(unused_classes)}")
    
    # Sort and print a sample
    unused_classes.sort()
    
    print("\n--- SAMPLE UNUSED CLASSES (First 50) ---")
    for cls in unused_classes[:50]:
        print(cls)
        
    print("\n--- STATISTICS ---")
    print(f"Total defined: {len(defined_classes)}")
    print(f"Total potentially unused: {len(unused_classes)}")
    print(f"Reduction potential: {len(unused_classes) / len(defined_classes) * 100:.1f}%")

if __name__ == "__main__":
    main()
