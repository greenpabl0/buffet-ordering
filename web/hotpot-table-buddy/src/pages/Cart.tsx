import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartItem } from "@/types/menu";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('currentCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRemoveItem = (itemId: string) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('currentCart', JSON.stringify(newCart));
    
    toast({
      title: "ลบรายการแล้ว",
      description: "สินค้าถูกลบออกจากตะกร้า",
    });
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "ตะกร้าว่าง",
        description: "กรุณาเลือกอาหารก่อนทำการสั่ง",
        variant: "destructive",
      });
      return;
    }

    // Save to order history
    const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const newOrder = {
      id: `order-${Date.now()}`,
      items: cart,
      totalPrice,
      status: 'preparing',
      orderTime: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    localStorage.setItem('orderHistory', JSON.stringify(orders));
    
    // Clear cart
    setCart([]);
    localStorage.removeItem('currentCart');
    
    toast({
      title: "สั่งอาหารสำเร็จ!",
      description: "กำลังเตรียมอาหารให้คุณ",
    });

    navigate('/history');
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
          <h1 className="text-2xl font-bold text-foreground">ตรวจสอบรายการ</h1>
        </div>

        {cart.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">ตะกร้าว่างเปล่า</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              กลับไปเลือกอาหาร
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">จำนวน: {item.quantity}</p>
                    <p className={`font-bold mt-1 ${item.price > 0 ? 'text-[hsl(25,90%,55%)]' : 'text-primary'}`}>
                      {item.price > 0 ? `${(item.price * item.quantity).toFixed(2)} บาท` : 'รวมในบุฟเฟต์'}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}

            <Card className="p-4 bg-card/80 border-primary/30">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-foreground">ยอดรวมเบื้องต้น:</span>
                <span className="font-bold text-primary text-xl">{totalPrice.toFixed(2)} บาท</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * ยังไม่รวมค่าบุฟเฟต์ต่อหัวและค่าน้ำ
              </p>
            </Card>

            <Button
              onClick={handleConfirmOrder}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
            >
              ยืนยันการสั่งอาหาร
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Cart;
