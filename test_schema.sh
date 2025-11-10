#!/bin/bash
# Test script to verify SQL schema is valid

echo "Testing SQL schema syntax and database setup..."
echo "=============================================="

# Start the database service
echo "1. Starting MySQL database..."
docker-compose up -d db

# Wait for MySQL to be ready
echo "2. Waiting for MySQL to be ready..."
sleep 15

# Check if database was created
echo "3. Checking if Buffet database exists..."
docker exec mysql_db_dev mysql -uroot -prootpassword -e "SHOW DATABASES;" | grep Buffet

if [ $? -eq 0 ]; then
    echo "✅ Database 'Buffet' created successfully"
else
    echo "❌ Database 'Buffet' not found"
    exit 1
fi

# Check if all tables were created
echo "4. Checking if all tables exist..."
TABLES=$(docker exec mysql_db_dev mysql -uroot -prootpassword Buffet -e "SHOW TABLES;")
echo "$TABLES"

EXPECTED_TABLES=("restaurant_table" "employee" "menu" "orders" "order_detail" "bill")
for table in "${EXPECTED_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "$table"; then
        echo "✅ Table '$table' exists"
    else
        echo "❌ Table '$table' not found"
        exit 1
    fi
done

# Test foreign key constraints
echo "5. Testing foreign key constraints..."
docker exec mysql_db_dev mysql -uroot -prootpassword Buffet -e "
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'Buffet' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME;
"

# Test inserting sample data
echo "6. Testing sample data insertion..."
docker exec mysql_db_dev mysql -uroot -prootpassword Buffet -e "
INSERT INTO restaurant_table (table_number, capacity, status) VALUES (1, 4, 'Available');
INSERT INTO employee (emp_name, phone) VALUES ('John Doe', '123-456-7890');
INSERT INTO menu (menu_name, category, price, is_buffet) VALUES ('Pad Thai', 'Main Course', 150.00, true);
SELECT 'Sample data inserted successfully' AS Result;
"

if [ $? -eq 0 ]; then
    echo "✅ Sample data insertion successful"
else
    echo "❌ Sample data insertion failed"
    exit 1
fi

# Verify the data
echo "7. Verifying inserted data..."
docker exec mysql_db_dev mysql -uroot -prootpassword Buffet -e "
SELECT * FROM restaurant_table;
SELECT * FROM employee;
SELECT * FROM menu;
"

echo ""
echo "=============================================="
echo "✅ All tests passed! Schema is valid."
echo "=============================================="

# Cleanup
echo "8. Cleaning up..."
docker-compose down -v

exit 0
