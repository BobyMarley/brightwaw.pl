import re
import cssutils
import logging

# Suppress annoying cssutils warnings
cssutils.log.setLevel(logging.CRITICAL)

INPUT_FILE = r'd:\work\2025\bright\www\index.css'
OUTPUT_FILE = r'd:\work\2025\bright\www\index.dedup.css'

def deduplicate_css():
    print(f"Reading {INPUT_FILE}...")
    parser = cssutils.CSSParser()
    try:
        stylesheet = parser.parseFile(INPUT_FILE)
    except Exception as e:
        print(f"Error parsing CSS: {e}")
        return

    # Dictionary to store { cssText_body : [selector_list] }
    # We want to map "color: red;" -> [".class1", ".class2"]
    rules_map = {}
    
    # Store other types of rules (media queries, keyframes, font-face) separately to preserve them
    # For simplicity in this script, we will focus on consolidating STYLE RULES at the root level first.
    # Handling duplicates INSIDE media queries is harder, so we will keep them as is for safety, 
    # or process them if they are identical media blocks.
    
    final_css_lines = []
    
    # We need a custom serializer to ensure consistent output format for comparison
    def get_style_text(style):
        return style.cssText.replace(' ', '').replace('\n', '').lower()

    print("Analyzing rules...")
    
    # We will do a simple pass: 
    # If it's a StyleRule, we check if we've seen this EXACT style declaration before.
    # If yes, we append the selector to the previous one.
    # If no, we add it.
    # Non-style rules (media, imports) are just kept as is.
    
    unique_rules = [] # List of tuples (type, content/obj)
    
    # Optimization: Map hash(style_string) -> index in unique_rules
    style_hash_map = {} 

    for rule in stylesheet.cssRules:
        if rule.type == rule.STYLE_RULE:
            # Normalize style text for comparison: "color:red;margin:0"
            style_text = get_style_text(rule.style)
            
            # Skip empty rules
            if not style_text:
                continue

            if style_text in style_hash_map:
                # We found a duplicate!
                existing_index = style_hash_map[style_text]
                existing_rule = unique_rules[existing_index][1]
                
                # Add current selector to existing rule
                # existing_rule.selectorText += f", {rule.selectorText}"
                # Using a list to avoid string concatenation overhead and sorting issues
                existing_rule.selectorList.append(rule.selectorText)
                
            else:
                # New unique rule
                style_hash_map[style_text] = len(unique_rules)
                # Parse selectors into a list to manage them cleanly
                # cssutils selectorList is handy
                unique_rules.append(('style', rule))
        else:
            # Keep media queries, keyframes, etc.
            unique_rules.append(('other', rule))

    print(f"Processed {len(stylesheet.cssRules)} rules.")
    print(f"Reduced to {len(unique_rules)} unique rules.")

    # Generate Output
    print(f"Writing to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for rule_type, rule in unique_rules:
            if rule_type == 'style':
                # Join selectors with comma and newline for readability
                # cssutils might mess up the formatting, so let's control it manually
                selectors = ', '.join([s.selectorText for s in rule.selectorList])
                # Clean up the style text (cssutils adds newlines we might not want, or we want specific format)
                # But for safety, let's trust cssutils cssText for the body
                f.write(f"{selectors} {{\n  {rule.style.cssText}\n}}\n\n")
            else:
                f.write(f"{rule.cssText}\n\n")

if __name__ == '__main__':
    deduplicate_css()
