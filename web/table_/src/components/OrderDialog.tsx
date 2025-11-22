import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CounterButton } from "@/components/CounterButton";
import { toast } from "sonner";

interface OrderDialogProps {
  tableNumber: number;
  branchId: string;
  orderDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

export function OrderDialog({
  tableNumber,
  branchId,
  orderDate,
  open,
  onOpenChange,
  onOrderCreated,
}: OrderDialogProps) {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  const [loading, setLoading] = useState(false);

  const adultPrice = 299;
  const kidPrice = 199;
  const refillPrice = 29;
  const totalPeople = adults + kids;
  const refills = totalPeople;
  const total = adults * adultPrice + kids * kidPrice + refills * refillPrice;

  const handleCreateOrder = async () => {
    if (adults === 0 && kids === 0) {
      toast.error("กรุณาเพิ่มผู้ใหญ่หรือเด็กอย่างน้อย 1 คน");
      return;
    }

    setLoading(true);

    try {
      // เรียก API เปิดโต๊ะใหม่
      const response = await fetch(`http://localhost:5000/api/orders/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_number: tableNumber,
          adults: adults,
          children: kids
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create order");

      toast.success("เปิดโต๊ะสำเร็จ! Order ID: " + data.orderId);
      onOrderCreated();
      // ส่งไปหน้า Order Summary พร้อม Order ID ที่ได้จาก Backend
      navigate(`/order-summary/${data.orderId}`);
      
    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>โต๊ะ {tableNumber} - เปิดโต๊ะใหม่</DialogTitle>
          <DialogDescription>
            ระบุจำนวนลูกค้าเพื่อคำนวณราคาเริ่มต้น
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base">ผู้ใหญ่ (฿{adultPrice})</Label>
            <div className="flex justify-center">
              <CounterButton value={adults} onChange={setAdults} />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-base">เด็ก (฿{kidPrice})</Label>
            <div className="flex justify-center">
              <CounterButton value={kids} onChange={setKids} />
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">รีฟิลน้ำ ({totalPeople} ท่าน)</span>
              <span className="font-semibold">฿{refills * refillPrice}</span>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>ยอดเริ่มต้น</span>
              <span className="text-primary">฿{total}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ยกเลิก
          </Button>
          <Button onClick={handleCreateOrder} disabled={loading} size="lg">
            {loading ? "กำลังบันทึก..." : "ยืนยันการเปิดโต๊ะ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}