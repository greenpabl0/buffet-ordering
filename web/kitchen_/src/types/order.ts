export type OrderStatus = "waiting" | "preparing" | "ready" | "served";

export interface OrderItem {
  menuItem: string;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: Date;
  isNew?: boolean;
}

export interface TableHistory {
  tableNumber: number;
  orders: Order[];
  isActive: boolean;
}
