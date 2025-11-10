#!/usr/bin/env python3
"""
SQL Schema Validation Script
Validates the Buffet-MySQL.sql file for common syntax errors
"""

import re
import sys

def validate_sql_file(filename):
    """Validate SQL file for common syntax errors"""
    errors = []
    warnings = []
    
    with open(filename, 'r') as f:
        content = f.read()
        lines = content.split('\n')
    
    print(f"Validating {filename}...")
    print("=" * 60)
    
    # Check 1: Trailing commas in CREATE TABLE statements
    print("\n1. Checking for trailing commas...")
    create_table_pattern = r'create table\s+\w+\s*\((.*?)\);'
    tables = re.findall(create_table_pattern, content, re.IGNORECASE | re.DOTALL)
    
    for i, table_def in enumerate(tables):
        # Check for comma before closing parenthesis
        if re.search(r',\s*\)', table_def):
            errors.append(f"Trailing comma found in table definition #{i+1}")
        else:
            print(f"   ✅ Table #{i+1}: No trailing comma")
    
    # Check 2: Missing commas between constraints
    print("\n2. Checking for missing commas between constraints...")
    # Look for patterns like "restrict\s+foreign key" without comma
    if re.search(r'(restrict|cascade)\s+(foreign\s+key|constraint)', content, re.IGNORECASE):
        errors.append("Missing comma between foreign key constraints")
    else:
        print("   ✅ No missing commas between constraints")
    
    # Check 3: DROP TABLE without IF EXISTS
    print("\n3. Checking DROP TABLE statements...")
    drop_without_if = re.findall(r'drop\s+table\s+(?!if\s+exists)(\w+)', content, re.IGNORECASE)
    if drop_without_if:
        warnings.append(f"DROP TABLE without IF EXISTS for: {', '.join(drop_without_if)}")
        print(f"   ⚠️  Found {len(drop_without_if)} DROP TABLE statements without IF EXISTS")
    else:
        print("   ✅ All DROP TABLE statements use IF EXISTS")
    
    # Check 4: Count tables
    print("\n4. Counting tables...")
    table_names = re.findall(r'create table\s+(\w+)', content, re.IGNORECASE)
    print(f"   ✅ Found {len(table_names)} tables: {', '.join(table_names)}")
    
    # Check 5: Foreign key references
    print("\n5. Checking foreign key references...")
    fk_pattern = r'foreign key\s*\([^)]+\)\s*references\s+(\w+)'
    foreign_keys = re.findall(fk_pattern, content, re.IGNORECASE)
    print(f"   ✅ Found {len(foreign_keys)} foreign key constraints")
    
    # Check 6: Check constraints
    print("\n6. Checking CHECK constraints...")
    check_constraints = re.findall(r'check\s*\([^)]+\)', content, re.IGNORECASE)
    print(f"   ✅ Found {len(check_constraints)} CHECK constraints")
    
    # Check 7: Generated columns
    print("\n7. Checking generated columns...")
    generated_cols = re.findall(r'generated always as', content, re.IGNORECASE)
    print(f"   ✅ Found {len(generated_cols)} generated column(s)")
    
    # Check 8: Enum types
    print("\n8. Checking ENUM types...")
    enums = re.findall(r"enum\s*\([^)]+\)", content, re.IGNORECASE)
    print(f"   ✅ Found {len(enums)} ENUM type(s)")
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    if errors:
        print(f"\n❌ ERRORS FOUND ({len(errors)}):")
        for error in errors:
            print(f"   - {error}")
    else:
        print("\n✅ No syntax errors found!")
    
    if warnings:
        print(f"\n⚠️  WARNINGS ({len(warnings)}):")
        for warning in warnings:
            print(f"   - {warning}")
    
    print("\n" + "=" * 60)
    
    return len(errors) == 0

if __name__ == "__main__":
    success = validate_sql_file("Buffet-MySQL.sql")
    sys.exit(0 if success else 1)
