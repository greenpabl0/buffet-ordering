import { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/menu";

const History = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orderHistory');
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Parse date strings back to Date objects
      const ordersWithDates = parsedOrders.map((order: any) => ({
        ...order,
        orderTime: new Date(order.orderTime),
      }));
      setOrders(ordersWithDates);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      preparing: { label: 'กำลังเตรียม', className: 'bg-[hsl(45,100%,85%)] text-[hsl(45,100%,30%)] border-0' },
      serving: { label: 'กำลังเสิร์ฟ', className: 'bg-[hsl(30,100%,75%)] text-[hsl(30,100%,25%)] border-0' },
      served: { label: 'เสิร์ฟแล้ว', className: 'bg-[hsl(145,60%,80%)] text-[hsl(145,60%,25%)] border-0' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (orderTime: Date) => {
    const day = orderTime.getDate().toString().padStart(2, '0');
    const month = (orderTime.getMonth() + 1).toString().padStart(2, '0');
    const year = orderTime.getFullYear() + 543; // Convert to Buddhist Era
    const hours = orderTime.getHours().toString().padStart(2, '0');
    const minutes = orderTime.getMinutes().toString().padStart(2, '0');
    const seconds = orderTime.getSeconds().toString().padStart(2, '0');
    
    return `วันที่ ${day}/${month}/${year} เวลา ${hours}:${minutes}:${seconds} น.`;
  };

  const getTimeAgo = (orderTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">รายการที่สั่ง</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">ยังไม่มีประวัติการสั่งอาหาร</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              เริ่มสั่งอาหาร
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">
                      บิลออเดอร์ที่ {orders.length - index}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(order.orderTime)}</span>
                      </div>
                      <span className="ml-5">{getTimeAgo(order.orderTime)}</span>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img 
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">ยอดรวม:</span>
                  <span className="font-bold text-primary">
                    {order.totalPrice > 0 ? `${order.totalPrice.toFixed(2)} บาท` : 'รวมในบุฟเฟต์'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default History;
