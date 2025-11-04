drop schema if exists Buffet;
create schema Buffet;
use Buffet;

drop table bill;
drop table employee;
drop table menu;
drop table orders;
drop table order_detail;
drop table restaurant_table;


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
    phone 			varchar(20),
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
        on delete restrict
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
