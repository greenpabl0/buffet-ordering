import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const CUSTOMER_APP_BASE_URL = "http://localhost:3000";
const BACKEND_BASE_URL = "http://localhost:5000";

interface OrderData {
  order_id: number;
  table_id: number;
  table_number: number; // จากการ Join ใน Backend
  emp_id: number;
  start_time: string;
  end_time: string | null;
  status: 'Open' | 'Closed' | 'Cancelled'; // สถานะจาก DB
  num_adults: number;
  num_children: number;
  adult_price: number;
  child_price: number;
  num_of_customers: number;
  // branch: { name: string };
  branch_name: string; 
  // สมมติว่าข้อมูลที่ได้รับจาก Backend จะมี branch_name ให้
}

const OrderSummary = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

// 1. ใช้ State เพื่อจัดการข้อมูล Order และ Loading
const [order, setOrder] = useState<OrderData | null>(null);
const [isLoading, setIsLoading] = useState(true);

// 2. Fetch data จาก API End-point ที่สร้างใน Backend
useEffect(() => {
  if (!orderId) {
      navigate("/");
      return;
  }

const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            // โยน Error เพื่อให้ถูกจับใน catch block
            throw new Error(data.error || "Failed to fetch order details.");
        }

        const fetchedOrder = data.order;
        
        // การ Mapping ชื่อ Field ให้ตรงกับโค้ด Frontend ที่เหลือ
        const mappedOrder: OrderData = {
            order_id: fetchedOrder.order_id,
            table_id: fetchedOrder.table_id,
            table_number: fetchedOrder.table_number,
            emp_id: fetchedOrder.emp_id,
            start_time: fetchedOrder.start_time,
            end_time: fetchedOrder.end_time,
            status: fetchedOrder.status,
            num_adults: fetchedOrder.num_adults,
            num_children: fetchedOrder.num_children,
            adult_price: parseFloat(fetchedOrder.adult_price),
            child_price: parseFloat(fetchedOrder.child_price),
            num_of_customers: fetchedOrder.num_of_customers,
            branch_name: "Default Branch" // 📌 เนื่องจาก API เราไม่ได้ Join branch, ใช้ค่าเริ่มต้น
        };

        setOrder(mappedOrder);
      } catch (error) {
        console.error("Fetch order error:", error.message);
        toast.error(`Error: ${error.message}`);
        // หากดึงข้อมูลไม่ได้ ให้นำกลับไปหน้าหลักหลังจากแจ้งเตือน
        navigate("/"); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate])

// 3. ปรับปรุง handleCompleteOrder (ใช้ fetch แทน supabase)
const handleCompleteOrder = async () => {
  if (!orderId) return;

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/orders/${orderId}/close`, { 
    // สมมติว่าเราจะสร้าง End-point 'close' สำหรับจบออร์เดอร์ใน Backend
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    // คุณอาจต้องการส่งข้อมูลการชำระเงิน หรืออื่นๆ ที่จำเป็น
    body: JSON.stringify({ 
    end_time: new Date().toISOString(),
                // ... ข้อมูลอื่นๆ
    })
  });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to complete order.");
        }

        toast.success("จบออเดอร์สำเร็จ");
        navigate("/");
    } catch (error) {
        console.error("Complete order error:", error.message);
        toast.error(`จบออเดอร์ไม่สำเร็จ: ${error.message}`);
    }
  };

// 4. แสดง Loading State
  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>กำลังโหลดข้อมูลออเดอร์...</p>
      </div>
    );
  }

// 5. ปรับปรุงการคำนวณและชื่อตัวแปรให้ตรงกับข้อมูลที่ดึงมา
  const adultPrice = order.adult_price;
  const kidPrice = order.child_price;
  const refillPrice = 29; // ค่านี้อาจเป็นค่าคงที่
  const adultsCount = order.num_adults;
  const kidsCount = order.num_children;
  
  // สมมติว่า Refills เท่ากับจำนวนลูกค้า
  const refillsCount = order.num_of_customers; // ใช้ num_of_customers
  
  const adultTotal = adultsCount * adultPrice;
  const kidTotal = kidsCount * kidPrice;
  const refillTotal = refillsCount * refillPrice;
  const totalAmount = adultTotal + kidTotal + refillTotal;

  const startTime = new Date(order.start_time);
  const endTime = order.end_time ? new Date(order.end_time) : new Date(new Date(order.start_time).getTime() + 2 * 60 * 60 * 1000);
  const duration = 120; // Fixed 2 hours

 // 6. สร้าง QR Code Link ไปยัง Customer App
  const customerOrderUrl = `${CUSTOMER_APP_BASE_URL}/order/${order.order_id}`;
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">สรุปออเดอร์</h1>
            {/* 7. แสดง table_number ที่ดึงมา */}
            <p className="text-muted-foreground">โต๊ะ {order.table_number}</p> 
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดออเดอร์</CardTitle>
            <CardDescription>
              {order.branch_name} - {format(startTime, "PPP")} 
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  ผู้ใหญ่ ({adultsCount} × ฿{adultPrice})
                </span>
                <span className="font-semibold">฿{adultTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  เด็ก ({kidsCount} × ฿{kidPrice})
                </span>
                <span className="font-semibold">฿{kidTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  รีฟิลน้ำ ({refillsCount} คน × ฿{refillPrice})
                </span>
                <span className="font-semibold">฿{refillTotal}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">ราคารวม</span>
                <span className="font-bold text-primary">฿{totalAmount}</span>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-medium">ข้อมูลเวลา</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">เวลาเริ่ม</p>
                  <p className="font-medium">{format(startTime, "HH:mm:ss")}</p>
                </div>
                {order.end_time && (
                  <div>
                    <p className="text-muted-foreground">เวลาสิ้นสุด</p>
                    <p className="font-medium">{format(endTime, "HH:mm:ss")}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-sm">ระยะเวลา</p>
                <p className="font-medium">{duration} นาที</p>
              </div>
            </div>

            {/* 8. QR Code สำหรับ Customer App */}
            <div className="flex flex-col items-center gap-4 border-2 border-dashed p-6 rounded-lg">
              <h3 className="text-xl font-semibold">สแกนเพื่อสั่งอาหาร (Customer)</h3>
              <div className="bg-white p-4 rounded-lg shadow-xl">
                <QRCodeSVG 
                  value={customerOrderUrl} 
                  size={200} 
                  level="H"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center break-all">
                URL: <span className="font-mono text-xs">{customerOrderUrl}</span>
              </p>
            </div>

            {order.status === "Open" && ( // เปลี่ยนเป็น "Open" ตาม ENUM ของ DB
              <Button onClick={handleCompleteOrder} className="w-full" size="lg">
                เสร็จสิ้นออเดอร์
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSummary;
