import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types/order";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TableHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableNumber: number | null;
  orders: Order[];
}

const statusLabels: Record<Order["status"], string> = {
  waiting: "รอทำ",
  preparing: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
  served: "เสิร์ฟแล้ว",
};

export const TableHistory = ({ open, onOpenChange, tableNumber, orders }: TableHistoryProps) => {
  if (!tableNumber) return null;

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      waiting: "bg-status-waiting text-warning-foreground",
      preparing: "bg-status-preparing text-primary-foreground",
      ready: "bg-status-ready text-primary-foreground",
      served: "bg-status-served text-muted-foreground",
    };
    return colors[status];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground text-center">
            ประวัติการสั่ง - โต๊ะ {tableNumber}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-xl">ยังไม่มีประวัติการสั่งอาหาร</p>
              </div>
            ) : (
              orders.map((order) => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div
                    key={order.id}
                    className="bg-secondary/50 rounded-lg border border-border p-4 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">
                              เวลา: <span className="font-medium text-foreground">{order.timestamp.toLocaleTimeString("th-TH")}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                              • รวม: <span className="font-semibold text-foreground">{totalItems} รายการ</span>
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="bg-secondary rounded px-2 py-0.5 font-semibold text-foreground min-w-[40px] text-center">
                                {item.quantity}x
                              </span>
                              <span className="text-foreground font-medium">{item.menuItem}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={cn("px-3 py-1 rounded-md font-semibold text-sm whitespace-nowrap", getStatusColor(order.status))}>
                        {statusLabels[order.status]}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
