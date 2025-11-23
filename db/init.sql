create schema if not exists Buffet;
use Buffet;

create table restaurant_table 
	(
    table_id 		int auto_increment primary key,
    table_number 	int unique not null,
    capacity 		int not null default 0,
    status 			enum('Available','Occupied') default 'Available'
	);

create table menu 
	(
    menu_id 		int auto_increment primary key,
    menu_name 		varchar(100) not null,
    category 		varchar(50),
    price 			decimal(10,2) not null check (price >= 0),
    is_buffet 		boolean default true,
    img_url 		varchar(255)
	);

create table orders 
	(
    order_id 		int auto_increment primary key,
    table_id 		int not null,
    start_time 		datetime not null,
    end_time 		datetime,
    status 			enum('Open','Closed','Cancelled') default 'Open',

    num_adults      int not null check (num_adults >= 0),
    num_children    int not null check (num_children >= 0),
    num_of_customers int check (num_of_customers > 0),
    foreign key (table_id) references restaurant_table(table_id)
        on update cascade
        on delete restrict
	);

create table order_detail 
	(
    order_detail_id int auto_increment primary key,
    order_id 		int not null,
    menu_id 		int not null,
    qty 			int not null check (qty > 0),
    status 			enum('Pending','Served','Cancelled') default 'Pending',
    note 			varchar(255),
    created_at      datetime,
    foreign key (order_id) references orders(order_id)
        on delete cascade,
    foreign key (menu_id) references menu(menu_id)
        on delete restrict
	);

create table bill 
	(
    bill_id 		int auto_increment primary key,
    order_id 		int not null,
    total_amount 	decimal(10,2) not null,
    pay_time 		datetime default current_timestamp,
    foreign key (order_id) references orders(order_id)
        on delete cascade
	);


CREATE INDEX idx_orders_table_status ON orders (table_id, status);
CREATE INDEX idx_order_detail_order_id ON order_detail (order_id);
CREATE INDEX idx_order_detail_status_created_at ON order_detail (status, created_at);
CREATE INDEX idx_bill_order_id ON bill (order_id);


-- mock data insertion

-- menu items
INSERT INTO menu (menu_name, category, price, is_buffet, img_url) VALUES
-- Meat/Pork
('Wagyu A5 Beef (Premium)', 'meat', 199.00, FALSE, NULL),
('Australian Beef (Premium)', 'meat', 99.00, FALSE, NULL),
('Pork Belly Slices', 'meat', 0.00, TRUE, NULL),
('Pork Slices', 'meat', 0.00, TRUE, NULL),
('Beef Slices', 'meat', 0.00, TRUE, NULL),
('Minced Pork', 'meat', 0.00, TRUE, NULL),

-- Seafood
('River Prawns (Premium)', 'seafood', 149.00, FALSE, NULL),
('White Shrimp', 'seafood', 0.00, TRUE, NULL),
('Squid', 'seafood', 0.00, TRUE, NULL),
('Mussels', 'seafood', 0.00, TRUE, NULL),
('Dory Fish', 'seafood', 0.00, TRUE, NULL),
('Crab Sticks', 'seafood', 0.00, TRUE, NULL),

-- Vegetables
('Chinese Water Spinach', 'vegetables', 0.00, TRUE, NULL),
('Chinese Cabbage', 'vegetables', 0.00, TRUE, NULL),
('Spring Onion', 'vegetables', 0.00, TRUE, NULL),
('Enoki Mushroom', 'vegetables', 0.00, TRUE, NULL),
('Straw Mushroom', 'vegetables', 0.00, TRUE, NULL),
('Baby Corn', 'vegetables', 0.00, TRUE, NULL),

-- Balls/Noodles
('Fish Balls', 'balls', 0.00, TRUE, NULL),
('Beef Balls', 'balls', 0.00, TRUE, NULL),
('Shrimp Balls', 'balls', 0.00, TRUE, NULL),
('Egg Noodles', 'balls', 0.00, TRUE, NULL),
('Udon Noodles', 'balls', 0.00, TRUE, NULL),
('Glass Noodles', 'balls', 0.00, TRUE, NULL),

-- A La Carte Dishes
('Fried Chicken Wings', 'alacarte', 89.00, FALSE, NULL),
('French Fries', 'alacarte', 59.00, FALSE, NULL),
('Garlic Fried Rice', 'alacarte', 69.00, FALSE, NULL),
('Chicken Karaage', 'alacarte', 79.00, FALSE, NULL),

-- Desserts
('Vanilla Ice Cream', 'desserts', 0.00, TRUE, NULL),
('Chocolate Ice Cream', 'desserts', 0.00, TRUE, NULL),
('Strawberry Ice Cream', 'desserts', 0.00, TRUE, NULL),
('Chocolate Cake', 'desserts', 49.00, FALSE, NULL);

-- restaurant tables
INSERT INTO restaurant_table (table_number) VALUES
(1), 
(2), 
(3), 
(4), 
(5), 
(6), 
(7), 
(8), 
(9);