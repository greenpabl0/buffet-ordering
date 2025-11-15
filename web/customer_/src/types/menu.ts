export interface MenuItem {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  isPremium?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'preparing' | 'serving' | 'served';
  orderTime: Date;
}
