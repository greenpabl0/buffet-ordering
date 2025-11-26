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
('Wagyu A5 Beef (Premium)', 'meat', 199.00, FALSE, 'https://wagyushop.com/cdn/shop/products/MgyuFiletMignon1_1024x1024.png?v=1649698474'),
('Australian Beef (Premium)', 'meat', 99.00, FALSE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqI6EF05Gqt26-LNe8XVCXD3qmzmr9XR5clg&s'),
('Pork Belly Slices', 'meat', 0.00, TRUE, 'https://www.chilesandsmoke.com/wp-content/uploads/2022/09/Texas-Smoked-Pork-Belly_Featured-001.jpg'),
('Pork Slices', 'meat', 0.00, TRUE, 'https://www.thefatbutcher.co.uk/cdn/shop/products/pork-belly-slices.jpg'),
('Beef Slices', 'meat', 0.00, TRUE, 'https://formesafood.com/cdn/shop/files/FORMESA-Premium-Low-Fat-Beef-Slice.jpg?v=1743639540'),
('Minced Pork', 'meat', 0.00, TRUE, 'https://www.sirinfarm.com/wp-content/uploads/2021/07/minced-pork-2.jpg'),

-- Seafood
('River Prawns (Premium)', 'seafood', 149.00, FALSE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlBIUT5RaVKKbjOz6ZgrW-rANm1mq3uJNI3QCviULuN8zsil2Dv1WYA4GkglVE1eTaXGQ&usqp=CAU'),
('White Shrimp', 'seafood', 0.00, TRUE, 'https://bluecoastmarket.com/cdn/shop/products/MexicanWhiteShrimp_2048x.jpg?v=1624328089'),
('Squid', 'seafood', 0.00, TRUE, 'https://img.freepik.com/premium-photo/squid-with-chevron-shabu-shabu-arranged-beautiful-plate_756258-2.jpg'),
('Mussels', 'seafood', 0.00, TRUE, 'https://fultonfishmarket.com/cdn/shop/articles/20220315181607-easy-steamed-mussels-recipe_b8c4a81a-44bc-4d45-9734-08e6a04fc17f_800x800.jpg?v=1736529342'),
('Dory Fish', 'seafood', 0.00, TRUE, 'https://bradleysfish.com/wp-content/uploads/2021/05/John-Dory-Fillets-1kg-Custom.jpg'),
('Crab Sticks', 'seafood', 0.00, TRUE, 'https://image.made-in-china.com/202f0j00pfQBzwcAEubd/Frozen-Surimi-Kanikama-Crab-Stick.webp'),

-- Vegetables
('Chinese Water Spinach', 'vegetables', 0.00, TRUE, 'https://images.squarespace-cdn.com/content/v1/5b064524710699f2ee8bfbb7/1547097052089-77HEJS0BACHE1V780WV6/chinesespinach.png?format=1500w'),
('Chinese Cabbage', 'vegetables', 0.00, TRUE, 'https://cdn.britannica.com/85/118285-050-70E3BCFE/Bok-choy-form-cabbage-Chinese.jpg'),
('Spring Onion', 'vegetables', 0.00, TRUE, 'https://hgtvhome.sndimg.com/content/dam/images/grdn/fullset/2014/4/23/0/spring-onions.jpg.rend.hgtvcom.1280.960.85.suffix/1452647546555.webp'),
('Enoki Mushroom', 'vegetables', 0.00, TRUE, 'https://www.out-grow.com/cdn/shop/products/white_enoki_mushrooms_1.jpg?v=1705354047'),
('Straw Mushroom', 'vegetables', 0.00, TRUE, 'https://images.tridge.com/300x300/image/original/9b/9d/30/9b9d302eb039822a201682cf131dbaa2304a90ce.jpg'),
('Baby Corn', 'vegetables', 0.00, TRUE, 'https://www.thetakeout.com/img/gallery/baby-corn-explained/intro-1724854549.jpg'),

-- Balls/Noodles
('Fish Balls', 'balls', 0.00, TRUE, 'https://www.etfoodvoyage.com/wp-content/uploads/2017/07/rsz_curry_fish_balls_5-Copy.jpg'),
('Beef Balls', 'balls', 0.00, TRUE, 'https://busycooks.com/wp-content/uploads/2024/11/Beef-Meatballs-2.jpg'),
('Shrimp Balls', 'balls', 0.00, TRUE, 'https://img-global.cpcdn.com/recipes/9db7c45eb37fc55f/240x320cq80/photo.jpg'),
('Egg Noodles', 'balls', 0.00, TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdmnaf_bD6hujQ6JKJNTsa1QihuRJcQ7xfJw&s'),
('Udon Noodles', 'balls', 0.00, TRUE, 'https://res.cloudinary.com/grow-me/v1709197867/xcak8yaptks6qcrdrlmj.jpg'),
('Glass Noodles', 'balls', 0.00, TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQojp1jPojWIC9YFS-awN052czagzwDpPh8ig&s'),

-- A La Carte Dishes
('Fried Chicken Wings', 'alacarte', 89.00, FALSE, 'https://thebigmansworld.com/wp-content/uploads/2024/07/fried-chicken-wings-recipe.jpg'),
('French Fries', 'alacarte', 59.00, FALSE, 'https://thecozycook.com/wp-content/uploads/2020/02/Copycat-McDonalds-French-Fries-.jpg'),
('Garlic Fried Rice', 'alacarte', 69.00, FALSE, 'https://khinskitchen.com/wp-content/uploads/2024/01/garlic-fried-rice-04.jpg'),
('Chicken Karaage', 'alacarte', 79.00, FALSE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTRwP1JDHEtTfq85gaqhygsv3nbwYBlbXz7Q&s'),

-- Desserts
('Vanilla Ice Cream', 'desserts', 0.00, TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh4X4pL-Nee-3yn9vOrjBUwJ2JZzFDEOnQhw&s'),
('Chocolate Ice Cream', 'desserts', 0.00, TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg3LNGOL9_d9vCDH7bYNyFo1YQnRaFyfvsYQ&s'),
('Strawberry Ice Cream', 'desserts', 0.00, TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxDRvs6A7l_XgQbRkmWUbLPX2BWZNFWPIuKw&s'),
('Chocolate Cake', 'desserts', 49.00, FALSE, 'https://static01.nyt.com/images/2024/06/20/multimedia/ya-easy-chocolate-layer-cake-gjcp/ya-easy-chocolate-layer-cake-gjcp-mediumSquareAt3X.jpg');
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