#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to fix mojibake (double UTF-8 encoding) in Python source files.
Converts broken text like "Ð ÂµÐ¡ÐÐ¡ÑÐ¡ÐÐ¡Ð" back to proper Cyrillic.
"""

import re
import os

def fix_mojibake(text):
    """
    Fix mojibake by decoding latin1 bytes as UTF-8.
    This handles the case where UTF-8 bytes were incorrectly interpreted as latin1.
    """
    try:
        # Try to encode as latin1 and decode as utf-8
        fixed = text.encode('latin1').decode('utf-8', errors='ignore')
        # Only return the fixed text if it actually changed
        if fixed != text and fixed.strip():
            return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass
    return text

def contains_mojibake(text):
    """Check if text contains mojibake characters."""
    # Common mojibake patterns indicating UTF-8 bytes interpreted as latin1
    mojibake_patterns = ['Ð', 'Â', '€', '¡', 'â', 'Ñ', 'Ð', 'º', '·']
    return any(char in text for char in mojibake_patterns)

def fix_python_file(file_path):
    """Fix mojibake in a Python file while preserving structure."""
    print(f"\nProcessing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    lines = content.split('\n')
    fixed_lines = []
    changes_count = 0
    examples = []

    for line_num, line in enumerate(lines, 1):
        if contains_mojibake(line):
            # Try to fix the line
            fixed_line = fix_mojibake(line)
            if fixed_line != line:
                changes_count += 1
                if len(examples) < 3:  # Keep first 3 examples
                    examples.append((line_num, line[:100], fixed_line[:100]))
                fixed_lines.append(fixed_line)
            else:
                fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    if changes_count > 0:
        # Write the fixed content
        fixed_content = '\n'.join(fixed_lines)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        print(f"  [OK] Fixed {changes_count} lines with mojibake")
        if examples:
            print(f"  Sample line numbers: {', '.join(str(ln) for ln, _, _ in examples)}")
        return True
    else:
        print(f"  No mojibake found")
        return False

def main():
    """Main function to fix mojibake in specified files."""
    files_to_fix = [
        r'E:\boltpromoFINAL\BoltPromo-main\backend\core\admin.py',
        r'E:\boltpromoFINAL\BoltPromo-main\backend\core\models.py',
        r'E:\boltpromoFINAL\BoltPromo-main\backend\core\views.py',
    ]

    print("=" * 70)
    print("Mojibake Fixer - Fixing UTF-8 encoding issues in Python files")
    print("=" * 70)

    fixed_files = []
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            if fix_python_file(file_path):
                fixed_files.append(file_path)
        else:
            print(f"\n[WARNING] File not found: {file_path}")

    print("\n" + "=" * 70)
    print("Summary:")
    print(f"  Total files processed: {len(files_to_fix)}")
    print(f"  Files with fixes: {len(fixed_files)}")
    if fixed_files:
        print(f"  Fixed files:")
        for f in fixed_files:
            print(f"    - {os.path.basename(f)}")
    print("=" * 70)

if __name__ == '__main__':
    main()
