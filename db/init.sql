create schema if not exists Buffet;
use Buffet;

create table restaurant_table 
	(
    table_id 		int auto_increment primary key,
    table_number 	int unique not null,
    capacity 		int not null,
    status 			enum('Available','Occupied','Reserved') default 'Available'
	);

create table employee 
	(
    emp_id 			int auto_increment primary key,
    emp_name 		varchar(100) not null,
    phone 			varchar(20)
	);

create table menu 
	(
    menu_id 		int auto_increment primary key,
    menu_name 		varchar(100) not null,
    category 		varchar(50),
    price 			decimal(10,2) not null check (price >= 0),
    is_buffet 		boolean default true
	);

create table orders 
	(
    order_id 		int auto_increment primary key,
    table_id 		int not null,
    emp_id          int,
    start_time 		datetime not null,
    end_time 		datetime,
    status 			enum('Open','Closed','Cancelled') default 'Open',

    num_adults      int not null check (num_adults >= 0),
    num_children    int not null check (num_children >= 0),
    adult_price     decimal(10,2) not null,
    child_price     decimal(10,2) not null,
    num_of_customers int check (num_of_customers > 0),
    foreign key (table_id) references restaurant_table(table_id)
        on update cascade
        on delete restrict,
    foreign key (emp_id) references employee(emp_id)
        on delete set null
	);

create table order_detail 
	(
    order_detail_id int auto_increment primary key,
    order_id 		int not null,
    menu_id 		int not null,
    qty 			int not null check (qty > 0),
    status 			enum('Pending','Served','Cancelled') default 'Pending',
    note 			varchar(255),
    foreign key (order_id) references orders(order_id)
        on delete cascade,
    foreign key (menu_id) references menu(menu_id)
        on delete restrict
	);

create table bill 
	(
    bill_id 		int auto_increment primary key,
    order_id 		int not null,
    emp_id 	        int,
    buffet_amount   decimal(10,2),
    other_amount    decimal(10,2),
    total_amount 	decimal(10,2) not null,
    discount 		decimal(10,2) default 0,
    net_amount 		decimal(10,2) generated always as (total_amount - discount) stored,
    pay_time 		datetime default current_timestamp,
    foreign key (order_id) references orders(order_id)
        on delete cascade,
    foreign key (emp_id) references employee(emp_id)
        on delete set null
	);


-- mock data insertion

-- menu items
INSERT INTO menu (menu_name, category, price, is_buffet) VALUES
-- Meat/Pork
('Wagyu A5 Beef (Premium)', 'meat', 199.00, FALSE),
('Australian Beef (Premium)', 'meat', 99.00, FALSE),
('Pork Belly Slices', 'meat', 0.00, TRUE),
('Pork Slices', 'meat', 0.00, TRUE),
('Beef Slices', 'meat', 0.00, TRUE),
('Minced Pork', 'meat', 0.00, TRUE),

-- Seafood
('River Prawns (Premium)', 'seafood', 149.00, FALSE),
('White Shrimp', 'seafood', 0.00, TRUE),
('Squid', 'seafood', 0.00, TRUE),
('Mussels', 'seafood', 0.00, TRUE),
('Dory Fish', 'seafood', 0.00, TRUE),
('Crab Sticks', 'seafood', 0.00, TRUE),

-- Vegetables
('Chinese Water Spinach', 'vegetables', 0.00, TRUE),
('Chinese Cabbage', 'vegetables', 0.00, TRUE),
('Spring Onion', 'vegetables', 0.00, TRUE),
('Enoki Mushroom', 'vegetables', 0.00, TRUE),
('Straw Mushroom', 'vegetables', 0.00, TRUE),
('Baby Corn', 'vegetables', 0.00, TRUE),

-- Balls/Noodles
('Fish Balls', 'balls', 0.00, TRUE),
('Beef Balls', 'balls', 0.00, TRUE),
('Shrimp Balls', 'balls', 0.00, TRUE),
('Egg Noodles', 'balls', 0.00, TRUE),
('Udon Noodles', 'balls', 0.00, TRUE),
('Glass Noodles', 'balls', 0.00, TRUE),

-- A La Carte Dishes
('Fried Chicken Wings', 'alacarte', 89.00, FALSE),
('French Fries', 'alacarte', 59.00, FALSE),
('Garlic Fried Rice', 'alacarte', 69.00, FALSE),
('Chicken Karaage', 'alacarte', 79.00, FALSE),

-- Desserts
('Vanilla Ice Cream', 'desserts', 0.00, TRUE),
('Chocolate Ice Cream', 'desserts', 0.00, TRUE),
('Strawberry Ice Cream', 'desserts', 0.00, TRUE),
('Chocolate Cake', 'desserts', 49.00, FALSE);

-- restaurant tables
INSERT INTO restaurant_table (table_number, capacity) VALUES
(1, 4), 
(2, 4), 
(3, 6), 
(4, 2), 
(5, 8), 
(6, 4), 
(7, 2), 
(8, 6), 
(9, 4);

-- employees
INSERT INTO employee (emp_name, phone) VALUES
('Sompong Sookjai', '0812345678'),
('Suda Rakdee', '0898765432'),
('Manee Khunmee', '0925551212');