import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { OrderDialog } from "@/components/OrderDialog";
import { cn } from "@/lib/utils";

const Tables = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // ดึงสถานะโต๊ะจาก API
  const { data: tables, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/api/tables");
      if (!response.ok) throw new Error("Failed to fetch tables");
      return response.json();
    },
    refetchInterval: 5000, // Auto refresh status
  });

  const handleTableClick = (table: any) => {
    if (table.status === "Available") {
      setSelectedTable(table.table_number);
    } else if (table.status === "Occupied" && table.active_order_id) {
      // ถ้าไม่ว่าง ให้ไปหน้า Summary เลย
      navigate(`/order-summary/${table.active_order_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">ร้านอาหารบุฟเฟต์ (Cashier)</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "PPP")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>จัดการโต๊ะ</CardTitle>
            <CardDescription>สีเขียว = ว่าง, สีแดง = ไม่ว่าง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {tables?.map((table: any) => (
                <Button
                  key={table.table_id}
                  onClick={() => handleTableClick(table)}
                  variant="outline"
                  className={cn(
                    "h-24 text-lg font-semibold transition-all flex flex-col",
                    table.status === "Available" && "bg-green-500 hover:bg-green-600 text-white border-green-600",
                    table.status === "Occupied" && "bg-red-500 hover:bg-red-600 text-white border-red-600"
                  )}
                >
                  <span>โต๊ะ {table.table_number}</span>
                  <span className="text-xs opacity-80 font-normal mt-1">
                    {table.status === "Available" ? "ว่าง" : `${table.capacity} ท่าน`}
                  </span>
                </Button>
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
          onOrderCreated={() => {
            refetch();
            setSelectedTable(null);
          }}
          branchId="1" // Dummy props to satisfy interface if needed
          orderDate=""
        />
      )}
    </div>
  );
};

export default Tables;