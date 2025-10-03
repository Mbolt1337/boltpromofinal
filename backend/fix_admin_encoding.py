#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script to fix mojibake in admin.py by re-encoding from latin-1 to UTF-8
"""

import sys

def fix_file_encoding(file_path):
    """Read file as latin-1 and write as UTF-8 to fix mojibake"""
    try:
        # Read with latin-1 encoding (this will read mojibake as it appears)
        with open(file_path, 'r', encoding='latin-1') as f:
            content = f.read()

        # Write back with UTF-8 encoding
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f'✓ Successfully fixed encoding in {file_path}')
        return True
    except Exception as e:
        print(f'✗ Error fixing {file_path}: {e}', file=sys.stderr)
        return False

if __name__ == '__main__':
    file_path = 'core/admin.py'
    success = fix_file_encoding(file_path)
    sys.exit(0 if success else 1)
