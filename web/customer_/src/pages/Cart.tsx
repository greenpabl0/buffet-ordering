import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Trash2, ArrowLeft, Home, ShoppingCart, History, Receipt, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const Header = ({ tableNumber }: { tableNumber?: number }) => (
  <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary shadow-md">
    <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">🔥</div>
          <div>
            <h1 className="font-bold text-lg text-secondary-foreground">Hot Pot Buffet</h1>
            <p className="text-xs text-secondary-foreground/80">{tableNumber ? `โต๊ะที่: ${tableNumber}` : "..."}</p>
          </div>
        </div>
    </div>
  </header>
);

const BottomNav = ({ orderId }: { orderId: string }) => {
  const navigate = useNavigate();
  const navTo = (path: string) => navigate(`${path}?orderId=${orderId}`);
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe h-16 flex items-center justify-around">
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/")}><Home className="h-5 w-5"/><span className="text-[10px]">เมนู</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1 text-primary" onClick={() => navTo("/cart")}><ShoppingCart className="h-5 w-5"/><span className="text-[10px]">ตะกร้า</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/history")}><History className="h-5 w-5"/><span className="text-[10px]">ประวัติ</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/receipt")}><Receipt className="h-5 w-5"/><span className="text-[10px]">ใบเสร็จ</span></Button>
    </nav>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<any[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const orderId = searchParams.get("orderId");

  const { data: orderData } = useQuery({
    queryKey: ["orderInfo", orderId],
    queryFn: async () => {
        if(!orderId) return null;
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if(!res.ok) return null;
        return res.json();
    },
    enabled: !!orderId
  });

  useEffect(() => {
    if (orderId) {
        const savedCart = localStorage.getItem(`cart_${orderId}`);
        if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, [orderId]);

  if (!orderId) return <div>Error: Missing Order ID</div>;

  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handlePreConfirm = () => {
    if (totalPrice > 0) setShowConfirmDialog(true);
    else processOrder();
  };

  const processOrder = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cart })
        });

        if (!res.ok) throw new Error("Failed");

        toast.success("ส่งออเดอร์เรียบร้อย!");
        localStorage.removeItem(`cart_${orderId}`);
        setCart([]);
        setShowConfirmDialog(false);
        navigate(`/history?orderId=${orderId}`); // *** สำคัญ: ส่ง ID ไปด้วย ***
    } catch (e) {
        toast.error("ส่งออเดอร์ไม่สำเร็จ โปรดลองใหม่");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <Header tableNumber={orderData?.order?.table_number} />
      <main className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" onClick={() => navigate(`/?orderId=${orderId}`)}><ArrowLeft className="w-5 h-5"/></Button>
            <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>
        </div>
        
        {cart.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground flex flex-col items-center">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p>ยังไม่มีรายการอาหารในตะกร้า</p>
                <Button variant="link" onClick={() => navigate(`/?orderId=${orderId}`)}>ไปเลือกอาหาร</Button>
            </div>
        ) : (
            <div className="space-y-4">
                {cart.map((item, idx) => (
                    <Card key={idx} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">x{item.quantity} ที่</p>
                                {Number(item.price) > 0 ? <p className="text-red-500 font-bold text-sm">+{Number(item.price) * item.quantity} บาท</p> : <p className="text-green-600 text-xs">บุฟเฟต์</p>}
                            </div>
                        </div>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                            const newCart = cart.filter((_, i) => i !== idx);
                            setCart(newCart);
                            localStorage.setItem(`cart_${orderId}`, JSON.stringify(newCart));
                        }}><Trash2 className="w-4 h-4"/></Button>
                    </Card>
                ))}

                <div className="bg-secondary/20 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span>จำนวนรายการ</span>
                        <span className="font-bold">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span>ยอดเงินเพิ่ม (ไม่รวมบุฟเฟต์)</span>
                        <span className={`font-bold ${totalPrice > 0 ? 'text-red-500' : 'text-green-600'}`}>{totalPrice > 0 ? `+${totalPrice} บาท` : '0 บาท'}</span>
                    </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold" size="lg" onClick={handlePreConfirm}>ยืนยันการสั่งอาหาร</Button>
            </div>
        )}
      </main>
      <BottomNav orderId={orderId} />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-6 w-6" />ยืนยันการสั่งเมนูพิเศษ</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>ในตะกร้ามีรายการที่ <strong>ไม่อยู่ในบุฟเฟต์</strong> และมีค่าใช้จ่ายเพิ่มเติม</p>
              <div className="bg-red-50 p-3 rounded text-center"><span className="text-gray-600">ยอดเงินที่ต้องจ่ายเพิ่ม</span><div className="text-2xl font-bold text-red-600">+{totalPrice} บาท</div></div>
              <p className="text-xs">ยอดนี้จะถูกรวมในบิลสุดท้ายเมื่อเช็คบิล</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={processOrder} className="bg-red-600 hover:bg-red-700">ยืนยันการสั่ง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;