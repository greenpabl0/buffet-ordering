import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { OrderDialog } from "@/components/OrderDialog";
import { cn } from "@/lib/utils";

const Tables = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  // Use current date and first branch automatically
  const currentDate = format(new Date(), "yyyy-MM-dd");

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branch").select("*");
      if (error) throw error;
      return data;
    },
  });

  const branchId = branches?.[0]?.id;
  const branch = branches?.[0];

  const { data: orders, refetch } = useQuery({
    queryKey: ["orders", branchId, currentDate],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("branch_id", branchId)
        .eq("order_date", currentDate)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  const getTableStatus = (tableNumber: number) => {
    return orders?.some((order) => order.table_number === tableNumber)
      ? "occupied"
      : "available";
  };

  const handleTableClick = (tableNumber: number) => {
    const status = getTableStatus(tableNumber);
    if (status === "available") {
      setSelectedTable(tableNumber);
    } else {
      const order = orders?.find((o) => o.table_number === tableNumber);
      if (order) {
        navigate(`/order-summary/${order.id}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{branch?.name || "ร้านอาหาร"}</h1>
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
                      status === "available" &&
                        "bg-success hover:bg-success/90 text-success-foreground border-success",
                      status === "occupied" &&
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

      {selectedTable && branchId && (
        <OrderDialog
          tableNumber={selectedTable}
          branchId={branchId}
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
