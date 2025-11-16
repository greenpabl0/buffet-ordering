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
import { supabase } from "@/integrations/supabase/client";
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

  // Auto-calculate refills based on total people
  const totalPeople = adults + kids;
  const refills = totalPeople;
  const total = adults * adultPrice + kids * kidPrice + refills * refillPrice;

  const handleCreateOrder = async () => {
    if (adults === 0 && kids === 0) {
      toast.error("กรุณาเพิ่มผู้ใหญ่หรือเด็กอย่างน้อย 1 คน");
      return;
    }

    setLoading(true);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const { data, error } = await supabase
      .from("orders")
      .insert({
        branch_id: branchId,
        table_number: tableNumber,
        adults_count: adults,
        kids_count: kids,
        refills_count: refills,
        total_amount: total,
        order_date: orderDate,
        status: "active",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error("สร้างออเดอร์ไม่สำเร็จ");
      console.error(error);
      return;
    }

    toast.success("สร้างออเดอร์สำเร็จ");
    onOrderCreated();
    navigate(`/order-summary/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>โต๊ะ {tableNumber} - ออเดอร์ใหม่</DialogTitle>
          <DialogDescription>
            ระบุจำนวนผู้ใหญ่และเด็ก
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base">ผู้ใหญ่ (฿{adultPrice} คน)</Label>
            <div className="flex justify-center">
              <CounterButton value={adults} onChange={setAdults} />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-base">เด็ก (฿{kidPrice} คน)</Label>
            <div className="flex justify-center">
              <CounterButton value={kids} onChange={setKids} />
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">รีฟิลน้ำ ({totalPeople} คน × ฿{refillPrice})</span>
              <span className="font-semibold">฿{refills * refillPrice}</span>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>ราคารวม</span>
              <span className="text-primary">฿{total}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              เวลา 2 ชั่วโมง
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleCreateOrder} disabled={loading} size="lg">
            {loading ? "กำลังสร้าง..." : "สร้างออเดอร์"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
