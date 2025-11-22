import { useEffect, useState } from "react";
import { ArrowLeft, Receipt as ReceiptIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

// Inline Header (Simplified)
const Header = () => (
  <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary shadow-md p-3 flex justify-center">
     <h1 className="font-bold text-lg">Hot Pot Buffet</h1>
  </header>
);

const Receipt = () => {
  const navigate = useNavigate();
  const orderId = localStorage.getItem("currentOrderId");

  const { data, isLoading } = useQuery({
    queryKey: ["receipt", orderId],
    queryFn: async () => {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed");
        return res.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  const { order, items } = data;
  
  // Pricing Logic
  const adultPrice = 299;
  const kidPrice = 199;
  const refillPrice = 29;
  
  const adultTotal = order.num_adults * adultPrice;
  const kidTotal = order.num_children * kidPrice;
  const refillTotal = order.num_of_customers * refillPrice;
  
  // Calculate A La Carte
  const alaCarteItems = items.filter((i: any) => Number(i.price) > 0);
  const alaCarteTotal = alaCarteItems.reduce((sum: number, i: any) => sum + (Number(i.price) * i.qty), 0);
  
  const grandTotal = adultTotal + kidTotal + refillTotal + alaCarteTotal;

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold">ใบเสร็จโดยประมาณ</h1>
        </div>

        <Card className="p-6 space-y-6 bg-white shadow-sm">
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">ใบแจ้งรายการ</h2>
                <p className="text-muted-foreground text-sm">Order #{order.order_id} | โต๊ะ {order.table_number}</p>
            </div>
            <Separator />
            
            {/* Buffet Head Count */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>ผู้ใหญ่ ({order.num_adults} ท่าน)</span>
                    <span>{adultTotal.toFixed(2)}</span>
                </div>
                {order.num_children > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>เด็ก ({order.num_children} ท่าน)</span>
                        <span>{kidTotal.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span>รีฟิลน้ำ ({order.num_of_customers} ท่าน)</span>
                    <span>{refillTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Add-ons */}
            {alaCarteItems.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">รายการเพิ่มเติม (A La Carte)</h3>
                        {alaCarteItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.menu_name} x{item.qty}</span>
                                <span>{(Number(item.price) * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Separator className="bg-black/10" />
            
            <div className="flex justify-between items-end">
                <span className="font-bold text-lg">ยอดรวมสุทธิ</span>
                <span className="font-bold text-2xl text-primary">{grandTotal.toFixed(2)} บาท</span>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
                *ราคานี้ยังไม่รวม VAT และ Service Charge (ถ้ามี) <br/>
                กรุณาติดต่อพนักงานเพื่อชำระเงิน
            </p>
        </Card>
      </main>
      
      {/* Simple Bottom Nav for context */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-center">
         <Button variant="ghost" onClick={() => navigate('/')}>กลับหน้าเมนู</Button>
      </div>
    </div>
  );
};

export default Receipt;