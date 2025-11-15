import { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types/menu";

const Receipt = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Mock data - ในการใช้งานจริงจะดึงจาก Database
  const adults = 2;
  const children = 1;

  useEffect(() => {
    const savedOrders = localStorage.getItem('orderHistory');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const buffetAdultPrice = 219;
  const drinkPrice = 69;
  const buffetChildPrice = 119;

  const totalCustomers = adults + children;
  const totalAlaCartePrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const buffetTotal = (adults * buffetAdultPrice) + (children * buffetChildPrice);
  const drinksTotal = totalCustomers * drinkPrice; // คิดน้ำทุกคน
  const grandTotal = buffetTotal + drinksTotal + totalAlaCartePrice;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">ใบเสร็จสรุป</h1>
        </div>

        <Card className="p-6 space-y-6">
          {/* Customer Count - Read Only */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground">จำนวนลูกค้า</h2>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <span className="text-sm font-semibold text-foreground">ผู้ใหญ่:</span>
                <p className="text-2xl font-bold text-primary">{adults} ท่าน</p>
              </div>
              
              <div>
                <span className="text-sm font-semibold text-foreground">เด็ก:</span>
                <p className="text-2xl font-bold text-primary">{children} ท่าน</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * ข้อมูลดึงจากระบบ | เด็ก: ส่วนสูง ≤130cm หรืออายุ ≤10ปี
            </p>
          </div>

          <Separator />

          {/* Buffet Charges */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-foreground">ค่าบุฟเฟต์</h2>
            
            {adults > 0 && (
              <div className="flex justify-between text-foreground">
                <span>ผู้ใหญ่ x {adults} ({buffetAdultPrice} บาท/ท่าน)</span>
                <span className="font-semibold">{(adults * buffetAdultPrice).toFixed(2)} บาท</span>
              </div>
            )}
            
            {children > 0 && (
              <div className="flex justify-between text-foreground">
                <span>เด็ก x {children} ({buffetChildPrice} บาท/ท่าน)</span>
                <span className="font-semibold">{(children * buffetChildPrice).toFixed(2)} บาท</span>
              </div>
            )}
            
            <div className="flex justify-between text-foreground">
              <span>น้ำรีฟิล x {totalCustomers} ({drinkPrice} บาท/ท่าน)</span>
              <span className="font-semibold">{drinksTotal.toFixed(2)} บาท</span>
            </div>
            <p className="text-xs text-muted-foreground">
              * น้ำรีฟิลบังคับคิดทุกคน (ผู้ใหญ่ + เด็ก)
            </p>
          </div>

          {totalAlaCartePrice > 0 && (
            <>
              <Separator />
              
              {/* A La Carte Items */}
              <div className="space-y-3">
                <h2 className="font-bold text-lg text-foreground">รายการเพิ่มเติม</h2>
                
                {orders.map((order) => 
                  order.items
                    .filter(item => item.price > 0)
                    .map((item) => (
                      <div key={`${order.id}-${item.id}`} className="flex justify-between text-sm text-foreground">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} บาท</span>
                      </div>
                    ))
                )}
              </div>
            </>
          )}

          <Separator className="border-primary/30" />

          {/* Grand Total */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-foreground">ยอดรวมทั้งหมด</span>
              <span className="text-2xl font-bold text-primary">{grandTotal.toFixed(2)} บาท</span>
            </div>
          </div>

          <Button 
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            size="lg"
          >
            <Printer className="w-5 h-5 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Receipt;
