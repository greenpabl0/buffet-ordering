import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderStripProps {
  order: Order;
  onServe: (orderId: string) => void;
  isRemoving?: boolean;
}

const statusLabels: Record<Order["status"], string> = {
  waiting: "รอทำ",
  preparing: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
  served: "เสิร์ฟแล้ว",
};

export const OrderStrip = ({ order, onServe, isRemoving }: OrderStripProps) => {
  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      waiting: "bg-status-waiting text-warning-foreground",
      preparing: "bg-status-preparing text-primary-foreground",
      ready: "bg-status-ready text-primary-foreground",
      served: "bg-status-served text-muted-foreground",
    };
    return colors[status];
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={cn(
        "bg-card rounded-lg border-2 border-border p-4 transition-all",
        order.isNew && "animate-slide-in border-status-waiting animate-pulse-glow",
        isRemoving && "animate-fade-out"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Table Number - Large and prominent */}
        <div className="flex-shrink-0">
          <div className="bg-primary rounded-lg px-6 py-3 min-w-[80px] text-center">
            <div className="text-xs text-primary-foreground/70 font-medium">โต๊ะ</div>
            <div className="text-4xl font-bold text-primary-foreground">{order.tableNumber}</div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-secondary rounded-md px-3 py-1 min-w-[60px] text-center">
                  <span className="text-xl font-bold text-foreground">{item.quantity}</span>
                  <span className="text-xs text-muted-foreground ml-1">x</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{item.menuItem}</h3>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <span className="text-sm text-muted-foreground">รวมทั้งหมด:</span>
            <span className="text-lg font-semibold text-foreground">{totalItems} รายการ</span>
          </div>
        </div>

        {/* Status and Action */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {/* Status Badge */}
          <div className={cn("px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap", getStatusColor(order.status))}>
            {statusLabels[order.status]}
          </div>

          {/* Serve Button */}
          <Button
            onClick={() => onServe(order.id)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-4 rounded-lg transition-all hover:scale-105"
            disabled={isRemoving}
          >
            เสิร์ฟทั้งหมด
          </Button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-3 text-xs text-muted-foreground text-right">
        {order.timestamp.toLocaleTimeString("th-TH")}
      </div>
    </div>
  );
};
