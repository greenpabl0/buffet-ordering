import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Home, ShoppingCart, History, Receipt, Plus, Minus, ShoppingBasket, AlertTriangle 
} from "lucide-react";

// Inline Components
const Header = ({ tableNumber = 13 }: { tableNumber?: number }) => (
  <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary shadow-md">
    <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">🔥</div>
          <div><h1 className="font-bold text-lg text-secondary-foreground">Hot Pot Buffet</h1></div>
        </div>
        <Button variant="outline" size="sm" className="border-secondary-foreground/30 text-secondary-foreground">TH</Button>
    </div>
  </header>
);

const BottomNav = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe h-16 flex items-center justify-around">
        <Button variant="ghost" className="flex flex-col h-full gap-1 text-primary" onClick={() => navigate("/")}><Home className="h-5 w-5"/><span className="text-[10px]">เมนู</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navigate("/cart")}><ShoppingCart className="h-5 w-5"/><span className="text-[10px]">ตะกร้า</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navigate("/history")}><History className="h-5 w-5"/><span className="text-[10px]">ประวัติ</span></Button>
        <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navigate("/receipt")}><Receipt className="h-5 w-5"/><span className="text-[10px]">ใบเสร็จ</span></Button>
    </nav>
  );
};

const MenuItem = ({ id, name, image, price, onAddToCart }: any) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border flex flex-col">
    <div className="relative h-40">
      <img src={image} alt={name} className="w-full h-full object-cover" />
      {price > 0 && <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">จ่ายเพิ่ม</div>}
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
      <div>
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className={`font-bold text-sm ${price > 0 ? 'text-red-500' : 'text-green-600'}`}>{price > 0 ? `+${price} บาท` : 'บุฟเฟต์'}</span>
        </div>
      </div>
      <Button size="sm" onClick={() => onAddToCart(id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-1" />หยิบใส่ตะกร้า</Button>
    </div>
  </Card>
);

const CartSummary = ({ totalItems, totalPrice, onCheckout }: any) => (
  <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t-2 border-primary shadow-lg z-50 mb-[60px]">
    <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-secondary-foreground">
          <div className="flex items-center gap-2"><ShoppingBasket className="w-5 h-5" /><span className="font-bold text-lg">{totalItems} รายการ</span></div>
          {totalPrice > 0 && <div className="flex items-center gap-2 text-red-600 bg-red-100 px-2 py-1 rounded-md"><span className="text-xs font-bold">เพิ่มเงิน</span><span className="font-bold text-lg">{totalPrice}.-</span></div>}
        </div>
        <Button onClick={onCheckout} size="sm" className="bg-primary text-primary-foreground font-bold shadow-md">ดูตะกร้า</Button>
    </div>
  </div>
);

const QuantityModal = ({ open, onClose, item, onConfirm }: any) => {
  const [quantity, setQuantity] = useState(1);
  const handleConfirm = () => { onConfirm(quantity); setQuantity(1); };
  const handleCancel = () => { setQuantity(1); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader><DialogTitle className="text-center">เลือกจำนวน</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-lg" />
          <div className="text-center">
             <p className="font-medium text-lg">{item.name}</p>
             <p className={item.price > 0 ? "text-red-500 font-bold" : "text-green-600"}>{item.price > 0 ? `ราคา ${item.price} บาท/ที่` : "รวมในบุฟเฟต์"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-12 w-12 rounded-full"><Minus className="h-5 w-5" /></Button>
            <span className="text-3xl font-bold min-w-[3rem] text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-12 w-12 rounded-full"><Plus className="h-5 w-5" /></Button>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={handleCancel} className="flex-1">ยกเลิก</Button><Button onClick={handleConfirm} className="flex-1">ตกลง</Button></DialogFooter>
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

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) localStorage.setItem("currentOrderId", orderId);
    const savedCart = localStorage.getItem("currentCart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [searchParams]);

  const { data: menuData = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
        const res = await fetch("http://localhost:5000/api/menu");
        if(!res.ok) throw new Error("Failed");
        return res.json();
    }
  });

  const categories = useMemo(() => {
    // ดึง Category จากข้อมูลจริง ถ้าไม่มีให้ใช้ 'Other'
    const cats = new Set(menuData.map((i: any) => i.category || "ทั่วไป"));
    return ["All", ...Array.from(cats)];
  }, [menuData]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === "All") return menuData;
    return menuData.filter((i: any) => (i.category || "ทั่วไป") === activeCategory);
  }, [activeCategory, menuData]);

  const handleAddToCart = (id: string) => { setSelectedItem(menuData.find((i: any) => i.id === id)); };

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
    localStorage.setItem("currentCart", JSON.stringify(newCart));
    toast.success(`เพิ่ม ${selectedItem.name} แล้ว`);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans">
      <Header />
      {/* Category Tabs Bar */}
      <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur border-b py-2">
        <div className="container max-w-6xl mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-1">
                {categories.map((cat: any) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                            ${activeCategory === cat 
                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        {cat === "All" ? "ทั้งหมด" : cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMenu.map((item: any) => (
            <MenuItem key={item.id} {...item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </main>
      
      {cart.length > 0 && (
        <CartSummary 
            totalItems={cart.reduce((s, i) => s + i.quantity, 0)} 
            totalPrice={cart.reduce((s, i) => s + (Number(i.price) * i.quantity), 0)} 
            onCheckout={() => navigate("/cart")} 
        />
      )}
      <BottomNav />
      
      {selectedItem && <QuantityModal open={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} onConfirm={handleConfirmQuantity} />}
    </div>
  );
};

export default Index;