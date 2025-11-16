import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { data: order, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*, branch(*)")
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  const handleCompleteOrder = async () => {
    if (!orderId) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status: "completed",
        end_time: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast.error("จบออเดอร์ไม่สำเร็จ");
      return;
    }

    toast.success("จบออเดอร์สำเร็จ");
    navigate("/");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const adultPrice = 299;
  const kidPrice = 199;
  const refillPrice = 29;

  const adultTotal = order.adults_count * adultPrice;
  const kidTotal = order.kids_count * kidPrice;
  const refillTotal = order.refills_count * refillPrice;
  const totalAmount = adultTotal + kidTotal + refillTotal;

  const startTime = new Date(order.start_time);
  const endTime = order.end_time ? new Date(order.end_time) : new Date(new Date(order.start_time).getTime() + 2 * 60 * 60 * 1000);
  const duration = 120; // Fixed 2 hours

  const paymentUrl = order.payment_url || `https://payment.example.com/order/${order.id}`;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">สรุปออเดอร์</h1>
            <p className="text-muted-foreground">โต๊ะ {order.table_number}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดออเดอร์</CardTitle>
            <CardDescription>
              {order.branch.name} - {format(new Date(order.order_date), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  ผู้ใหญ่ ({order.adults_count} × ฿{adultPrice})
                </span>
                <span className="font-semibold">฿{adultTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  เด็ก ({order.kids_count} × ฿{kidPrice})
                </span>
                <span className="font-semibold">฿{kidTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  รีฟิลน้ำ ({order.refills_count} × ฿{refillPrice})
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

            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={paymentUrl} size={200} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                สแกน QR Code เพื่อชำระเงิน
              </p>
            </div>

            {order.status === "active" && (
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
