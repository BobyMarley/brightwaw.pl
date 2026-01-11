import re

def minify_css(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            css = f.read()

        # Remove comments
        css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
        
        # Collapse whitespace
        css = re.sub(r'\s+', ' ', css)
        css = re.sub(r'\s*([\{\}:;,])\s*', r'\1', css)
        css = css.replace(';}', '}')
        
        # Optimize zero units (0px -> 0)
        css = re.sub(r'(?<=[: ])0(?:px|em|rem|%)', '0', css)
        
        # Shorten hex codes (#ffffff -> #fff)
        css = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', css)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(css)

        original_size = len(css) # Approx since we already modified it in memory for logging, but file write is real
        # Re-read for accurate size
        with open(output_file, 'r', encoding='utf-8') as f:
            final_size = len(f.read())
            
        print(f"Minified {input_file} -> {output_file}")
        print(f"Final size: {final_size} bytes")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    minify_css('index.css', 'index.min.css')
