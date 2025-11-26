import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Home, ShoppingCart, History, Receipt, Plus, Minus, ShoppingBasket, ScanLine
} from "lucide-react";

// --- Inline Components ---

const Header = ({ tableNumber }: { tableNumber?: number }) => (
  <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary shadow-md">
    <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
            🔥
          </div>
          <div>
            <h1 className="font-bold text-lg text-secondary-foreground leading-tight">Hot Pot Buffet</h1>
            <p className="text-xs text-secondary-foreground/80">
                {tableNumber ? `โต๊ะที่: ${tableNumber}` : "..."}
            </p>
          </div>
        </div>
    </div>
  </header>
);

// บังคับส่ง OrderID ไปทุก Link
const BottomNav = ({ orderId }: { orderId: string }) => {
  const navigate = useNavigate();
  const navTo = (path: string) => navigate(`${path}?orderId=${orderId}`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe h-[60px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="container max-w-6xl mx-auto px-2 h-full">
        <div className="flex items-center justify-around h-full">
            <Button variant="ghost" className="flex flex-col h-full gap-1 w-full rounded-none hover:bg-gray-50 data-[active=true]:text-primary" onClick={() => navTo("/")}><Home className="h-5 w-5"/><span className="text-[10px] font-medium">เมนู</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1 w-full rounded-none hover:bg-gray-50 data-[active=true]:text-primary" onClick={() => navTo("/cart")}><ShoppingCart className="h-5 w-5"/><span className="text-[10px] font-medium">ตะกร้า</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1 w-full rounded-none hover:bg-gray-50 data-[active=true]:text-primary" onClick={() => navTo("/history")}><History className="h-5 w-5"/><span className="text-[10px] font-medium">ประวัติ</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1 w-full rounded-none hover:bg-gray-50 data-[active=true]:text-primary" onClick={() => navTo("/receipt")}><Receipt className="h-5 w-5"/><span className="text-[10px] font-medium">ใบเสร็จ</span></Button>
        </div>
      </div>
    </nav>
  );
};

const MenuItem = ({ id, name, image, price, onAddToCart }: any) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border-gray-100 flex flex-col h-full">
    <div className="relative h-40 bg-gray-100">
      <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
      {price > 0 && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md border border-white/20">
          จ่ายเพิ่ม
        </div>
      )}
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] leading-snug">{name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className={`font-bold text-xs px-2 py-0.5 rounded ${price > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {price > 0 ? `+${price} บาท` : 'บุฟเฟต์'}
          </span>
        </div>
      </div>
      <Button 
        size="sm" 
        onClick={() => id ? onAddToCart(id) : console.error("No ID")} 
        className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4 mr-1.5" /> หยิบใส่ตะกร้า
      </Button>
    </div>
  </Card>
);

const CartSummary = ({ totalItems, totalPrice, onCheckout }: any) => (
  <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-10">
    <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <ShoppingBasket className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-sm">{totalItems} รายการ</span>
            {totalPrice > 0 ? (
                <span className="text-xs text-red-500 font-semibold">เพิ่มเงิน {totalPrice}.-</span>
            ) : (
                <span className="text-xs text-green-600 font-medium">รวมในบุฟเฟต์</span>
            )}
          </div>
        </div>
        <Button onClick={onCheckout} size="sm" className="bg-primary text-white font-bold px-6 shadow-md hover:shadow-lg active:scale-95 transition-all">
          ดูตะกร้า
        </Button>
    </div>
  </div>
);

const QuantityModal = ({ open, onClose, item, onConfirm }: any) => {
  const [quantity, setQuantity] = useState(1);
  const handleConfirm = () => { onConfirm(quantity); setQuantity(1); };
  const handleCancel = () => { setQuantity(1); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-xs w-[90%] rounded-xl bg-white p-0 overflow-hidden gap-0">
        <div className="bg-slate-50 p-6 flex flex-col items-center border-b">
            <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md mb-4 bg-white">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-gray-800 mb-1">{item.name}</DialogTitle>
            <p className={`text-sm font-medium ${item.price > 0 ? "text-red-500" : "text-green-600"}`}>
                {item.price > 0 ? `ราคาพิเศษ ${item.price} บาท/ที่` : "รวมในบุฟเฟต์ (ฟรี)"}
            </p>
        </div>
        
        <div className="p-6 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-6 w-full">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-14 w-14 rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all" disabled={quantity <= 1}><Minus className="h-6 w-6" /></Button>
                <div className="w-16 text-center"><span className="text-4xl font-bold text-gray-800">{quantity}</span></div>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-14 w-14 rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"><Plus className="h-6 w-6" /></Button>
            </div>
            <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={handleCancel} className="flex-1 h-12 rounded-lg border-gray-200 text-gray-600">ยกเลิก</Button>
                <Button onClick={handleConfirm} className="flex-1 h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-md">ตกลง</Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // *** Strict Mode: Use URL Param ONLY ***
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
        // Load Cart specific to this order
        const savedCart = localStorage.getItem(`cart_${orderId}`);
        if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, [orderId]);

  // ถ้าไม่มี OrderID ให้แสดงหน้าเตือน (ป้องกันการมั่วโต๊ะ)
  if (!orderId) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center max-w-sm w-full">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <ScanLine className="w-12 h-12 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลโต๊ะ</h1>
                  <p className="text-gray-500 text-sm mb-6">กรุณาสแกน QR Code ที่โต๊ะใหม่อีกครั้งเพื่อเริ่มสั่งอาหาร</p>
              </div>
          </div>
      );
  }

  const { data: menuData = [] } = useQuery({
    queryKey: ["menu_data_v3"], // New Key
    queryFn: async () => {
        const res = await fetch("http://localhost:5000/api/menu");
        if(!res.ok) throw new Error("Failed");
        const rawData = await res.json();
        return rawData.map((item: any) => ({
            id: String(item.menu_id || item.id),           
            name: item.menu_name || item.name,       
            price: Number(item.price || 0),
            category: item.category,
            image: item.img_url || "https://placehold.co/300x200",
            is_buffet: item.is_buffet
        }));
    }
  });

  const { data: orderData } = useQuery({
    queryKey: ["orderInfo", orderId],
    queryFn: async () => {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if(!res.ok) return null;
        return res.json();
    },
    enabled: !!orderId
  });

  const categories = useMemo(() => {
    const cats = new Set(menuData.map((i: any) => i.category || "ทั่วไป"));
    return ["All", ...Array.from(cats)];
  }, [menuData]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === "All") return menuData;
    return menuData.filter((i: any) => (i.category || "ทั่วไป") === activeCategory);
  }, [activeCategory, menuData]);

  const handleAddToCart = (id: string) => { 
      const item = menuData.find((i: any) => i.id === id);
      if (item) setSelectedItem(item);
  };

  const handleConfirmQuantity = (quantity: number) => {
    if (!selectedItem) return;
    const existing = cart.find((item) => item.id === selectedItem.id);
    let newCart;
    if (existing) {
      newCart = cart.map((item) => item.id === selectedItem.id ? { ...item, quantity: item.quantity + quantity } : item);
    } else {
      newCart = [...cart, { ...selectedItem, quantity }];
    }
    setCart(newCart);
    localStorage.setItem(`cart_${orderId}`, JSON.stringify(newCart));
    toast.success(`เพิ่ม ${selectedItem.name} x${quantity} เรียบร้อย`);
    setSelectedItem(null);
  };

  const handleCheckout = () => {
      navigate(`/cart?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <Header tableNumber={orderData?.order?.table_number} />
      <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur border-b border-gray-100 py-3 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
                <button onClick={() => setActiveCategory("All")} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeCategory === "All" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>ทั้งหมด</button>
                {categories.filter(c => c !== "All").map((cat: any) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${activeCategory === cat ? "bg-primary text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat}</button>
                ))}
            </div>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenu.map((item: any, index: number) => {
            if (!item.id) return null;
            return (
                <MenuItem key={item.id} id={item.id} {...item} onAddToCart={handleAddToCart} />
            );
          })}
        </div>
        <div className="h-20"></div>
      </main>
      
      {cart.length > 0 && (
        <CartSummary totalItems={cart.reduce((s, i) => s + i.quantity, 0)} totalPrice={cart.reduce((s, i) => s + (Number(i.price) * i.quantity), 0)} onCheckout={handleCheckout} />
      )}
      <BottomNav orderId={orderId} />
      {selectedItem && <QuantityModal open={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} onConfirm={handleConfirmQuantity} />}
    </div>
  );
};

export default Index;