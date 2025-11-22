import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { OrderDialog } from "@/components/OrderDialog";
import { cn } from "@/lib/utils";

const BACKEND_BASE_URL = "http://localhost:5000";

const Tables = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  // Use current date and first branch automatically
  const currentDate = format(new Date(), "yyyy-MM-dd");

  // 1. ดึง Active Orders จาก API Backend ใหม่
  const { 
    data: orders, 
    refetch, 
    isLoading, // เพิ่ม isLoading
    error // เพิ่ม error
  } = useQuery({
    // queryKey ควรมีแค่ orders หรือเพิ่ม date เข้าไป
    queryKey: ["activeOrders", currentDate], 
    queryFn: async () => {
      // เปลี่ยนไปเรียก End-point ใหม่
      const response = await fetch(`${BACKEND_BASE_URL}/api/orders/active`);
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch active orders.");
      }
      
      const data = await response.json();
      // API ของเราส่งข้อมูลกลับมาในรูปแบบ { success: true, orders: [...] }
      return data.orders || []; // ดึง array orders ออกมา
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getTableStatus = (tableNumber: number) => {
    return orders && orders.some((order) => order.table_number === tableNumber)
      ? "Occupied"
      : "Available";
  };

  const handleTableClick = (tableNumber: number) => {
    const status = getTableStatus(tableNumber);
    if (status === "Available") {
      setSelectedTable(tableNumber);
    } else {
      const order = orders?.find((o) => o.table_number === tableNumber);
      if (order && order.order_id) { // ใช้ order.order_id ที่ดึงจาก API
        navigate(`/order-summary/${order.order_id}`); 
      }
    }
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-background p-4 flex justify-center items-center text-xl font-semibold">
              <p>กำลังโหลดข้อมูลตาราง...</p>
          </div>
      );
  }

  if (error) {
       return (
          <div className="min-h-screen bg-background p-4 text-center pt-20">
              <h1 className="text-xl text-destructive font-bold">เกิดข้อผิดพลาดในการเชื่อมต่อ</h1>
              <p className="text-muted-foreground">ไม่สามารถดึงข้อมูล Active Orders ได้ (โปรดตรวจสอบ Backend Port 5000)</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">"ร้านอาหาร"</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "PPP")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>เลือกโต๊ะ</CardTitle>
            <CardDescription>
              สีเขียว = ว่าง, สีแดง = มีคนนั่ง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((tableNumber) => {
                const status = getTableStatus(tableNumber);
                return (
                    <Button
                    key={tableNumber}
                    onClick={() => handleTableClick(tableNumber)}
                    variant="outline"
                    className={cn(
                      "h-24 text-lg font-semibold transition-all",
                      status === "Available" &&
                        "bg-success hover:bg-success/90 text-success-foreground border-success",
                      status === "Occupied" &&
                        "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive"
                    )}
                  >
                    โต๊ะ {tableNumber}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTable && (
        <OrderDialog
          tableNumber={selectedTable}
          orderDate={currentDate}
          open={selectedTable !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTable(null);
          }}
          onOrderCreated={() => {
            refetch();
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
};

export default Tables;
