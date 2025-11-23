import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Settings, RefreshCw, Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Inline Component: CounterButton ---
interface CounterButtonProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function CounterButton({ value, onChange, min = 0, max = 99 }: CounterButtonProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-12 w-12 rounded-full border-2 border-primary hover:bg-primary/10"
      >
        <Minus className="h-5 w-5 text-primary" />
      </Button>
      <span className="text-3xl font-semibold min-w-[3rem] text-center">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-12 w-12 rounded-full border-2 border-primary hover:bg-primary/10"
      >
        <Plus className="h-5 w-5 text-primary" />
      </Button>
    </div>
  );
}

// --- Inline Component: OrderDialog ---
interface OrderDialogProps {
  tableNumber: number;
  branchId: string;
  orderDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

function OrderDialog({
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

// --- Main Page: Tables ---

const Tables = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const { data: tables, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/api/tables");
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
    refetchInterval: 3000,
  });

  const handleTableClick = (table: any) => {
    if (table.status === "Available") {
      setSelectedTable(table.table_number);
    } else if (table.status === "Occupied" && table.active_order_id) {
      navigate(`/order-summary/${table.active_order_id}`);
    } else {
        toast.error("เกิดข้อผิดพลาด: โต๊ะไม่ว่างแต่ไม่พบออเดอร์ กรุณากดรีเซ็ต");
    }
  };

  const handleResetTable = async (e: any, tableId: number) => {
    e.stopPropagation();
    if(!confirm("ต้องการรีเซ็ตสถานะโต๊ะนี้ให้เป็น 'ว่าง' ใช่หรือไม่? (ใช้เมื่อระบบค้าง)")) return;

    try {
        await fetch(`http://localhost:5000/api/tables/${tableId}/reset`, { method: "POST" });
        toast.success("รีเซ็ตสถานะโต๊ะเรียบร้อย");
        refetch();
    } catch (e) {
        toast.error("รีเซ็ตไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ร้านอาหารบุฟเฟต์ (Cashier)</h1>
            <p className="text-muted-foreground">{format(new Date(), "PPP")}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/menu")}>
            <Settings className="mr-2 h-4 w-4"/> จัดการเมนูอาหาร
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>สถานะโต๊ะ</CardTitle>
            <CardDescription>กดที่โต๊ะว่างเพื่อเปิดบิล | กดปุ่ม <Trash2 className="inline w-3 h-3"/> เพื่อรีเซ็ตโต๊ะที่ค้าง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {tables?.map((table: any) => (
                <div key={table.table_id} className="relative group">
                    <Button
                    onClick={() => handleTableClick(table)}
                    variant="outline"
                    className={cn(
                        "w-full h-28 text-lg font-semibold transition-all flex flex-col justify-center gap-1 border-2",
                        table.status === "Available" 
                            ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" 
                            : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    )}
                    >
                    <span className="text-2xl">โต๊ะ {table.table_number}</span>
                    <span className="text-xs opacity-80 font-normal mt-1 px-2 py-0.5 rounded-full bg-white/50">
                        {table.status === "Available" ? "ว่าง" : `${table.capacity} ท่าน`}
                    </span>
                    </Button>
                    
                    {table.status === "Occupied" && (
                        <button 
                            onClick={(e) => handleResetTable(e, table.table_id)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 p-1.5 rounded-full shadow-sm transition-colors z-10"
                            title="รีเซ็ตสถานะโต๊ะ (Force Reset)"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTable && (
        <OrderDialog
          tableNumber={selectedTable}
          open={selectedTable !== null}
          onOpenChange={(open) => !open && setSelectedTable(null)}
          onOrderCreated={() => { refetch(); setSelectedTable(null); }}
          branchId="1" orderDate=""
        />
      )}
    </div>
  );
};

export default Tables;