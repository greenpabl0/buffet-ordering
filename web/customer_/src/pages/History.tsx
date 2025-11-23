import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, Utensils, Home, ShoppingCart, History as HistoryIcon, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-40 h-16 flex items-center justify-around">
            <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/")}><Home className="h-5 w-5"/><span className="text-[10px]">เมนู</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/cart")}><ShoppingCart className="h-5 w-5"/><span className="text-[10px]">ตะกร้า</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1 text-primary" onClick={() => navTo("/history")}><HistoryIcon className="h-5 w-5"/><span className="text-[10px]">ประวัติ</span></Button>
            <Button variant="ghost" className="flex flex-col h-full gap-1" onClick={() => navTo("/receipt")}><Receipt className="h-5 w-5"/><span className="text-[10px]">ใบเสร็จ</span></Button>
        </nav>
    );
};

const History = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data, isLoading } = useQuery({
    queryKey: ["orderHistory", orderId],
    queryFn: async () => {
        if(!orderId) return null;
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!res.ok) return null;
        return res.json();
    },
    refetchInterval: 3000,
  });

  if (!orderId) return <div>Error</div>;
  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  const hasItems = data && data.items && data.items.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <Header tableNumber={data?.order?.table_number} />
      <main className="container max-w-6xl mx-auto px-4 py-4 space-y-4">
        {!hasItems ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Utensils className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">ยังไม่มีประวัติการสั่งอาหาร</p>
                <Button variant="link" onClick={() => navigate(`/?orderId=${orderId}`)}>ไปหน้าเมนู</Button>
            </div>
        ) : (
            <div className="space-y-3">
                {data.items.sort((a: any, b: any) => (a.status === 'Pending' ? -1 : 1)).map((item: any, idx: number) => (
                    <Card key={idx} className="p-4 flex justify-between items-center border-l-4 border-l-primary">
                        <div>
                            <h3 className="font-bold text-lg">{item.menu_name}</h3>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <span>จำนวน: {item.qty}</span>
                                {Number(item.price) > 0 && <span className="text-red-500 font-medium">(+{Number(item.price) * item.qty} บ.)</span>}
                            </div>
                        </div>
                        <div>
                            {item.status === "Served" ? (
                                <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle className="w-3 h-3"/> เสิร์ฟแล้ว</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1 animate-pulse"><Clock className="w-3 h-3"/> กำลังเตรียม</Badge>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </main>
      <BottomNav orderId={orderId} />
    </div>
  );
};

export default History;