import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      if (res.status === 404) throw new Error("NOT_FOUND");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!orderId,
    retry: false,
  });

  if (isLoading) return <div className="p-8 flex justify-center">Loading...</div>;
  if (error || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">ไม่พบข้อมูลออเดอร์ #{orderId}</h2>
        <Button onClick={() => navigate("/")} className="mt-4">กลับหน้าหลัก</Button>
    </div>
  );

  const { order, items } = data;

  // ราคาบุฟเฟต์
  const adultTotal = order.num_adults * 299;
  const kidTotal = order.num_children * 199;
  const refillTotal = order.num_of_customers * 29;
  
  // *** การแก้ไข: กรองเอาเฉพาะรายการที่มีราคา > 0 ***
  const billItems = items.filter((i: any) => Number(i.price) > 0);
  
  const alaCarteTotal = billItems.reduce((sum: number, i: any) => sum + (Number(i.price) * i.qty), 0);
  const totalAmount = adultTotal + kidTotal + refillTotal + alaCarteTotal;

  const handleCompleteOrder = async () => {
    try {
        await fetch(`http://localhost:5000/api/orders/${orderId}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ total_amount: totalAmount })
        });
        toast.success("เช็คบิลสำเร็จ");
        navigate("/");
    } catch(e) { toast.error("เกิดข้อผิดพลาด"); }
  };

  const customerUrl = `http://${window.location.hostname}:3000?orderId=${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(customerUrl)}`;

  return (
    <div className="min-h-screen bg-background p-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h1 className="text-2xl font-bold">สรุปออเดอร์ (Cashier)</h1></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order #{order.order_id} - Table {order.table_number}</CardTitle>
            <CardDescription>{format(new Date(order.start_time), "PPP HH:mm")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground"><span>ผู้ใหญ่ ({order.num_adults})</span><span>{adultTotal}</span></div>
              {order.num_children > 0 && <div className="flex justify-between text-muted-foreground"><span>เด็ก ({order.num_children})</span><span>{kidTotal}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>น้ำรีฟิล ({order.num_of_customers})</span><span>{refillTotal}</span></div>
              
              {/* แสดงเฉพาะรายการที่เสียเงินเพิ่ม */}
              {billItems.length > 0 && (
                 <>
                    <Separator className="my-2"/>
                    <div className="text-sm font-semibold mb-2">รายการเพิ่มเติม (A La Carte):</div>
                    {billItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span>{item.menu_name} x{item.qty}</span>
                            <span>{Number(item.price) * item.qty}</span>
                        </div>
                    ))}
                 </>
              )}

              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>ยอดรวมสุทธิ</span>
                <span>฿{totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 bg-secondary/20 rounded-lg">
              <img src={qrCodeUrl} alt="QR" className="w-48 h-48 bg-white p-2 rounded"/>
              <div className="text-center px-4 w-full">
                <p className="text-xs text-muted-foreground mb-1">Scan to Order</p>
                <a href={customerUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all block">{customerUrl}</a>
              </div>
            </div>

            <Button onClick={handleCompleteOrder} className="w-full" size="lg">เช็คบิล / ปิดโต๊ะ</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSummary;