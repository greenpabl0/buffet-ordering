import { useState, useEffect, useRef } from "react";
import { Order, OrderItem } from "@/types/order";
import { OrderStrip } from "@/components/OrderStrip";
import { TableSelector } from "@/components/TableSelector";
import { TableHistory } from "@/components/TableHistory";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

// Mock data generator for demo
const generateMockOrder = (tableNumber: number): Order => {
  const menuItems = [
    "ปลาแซลมอนย่าง", "สเต็กเนื้อ", "ทอมยำกุ้ง", "ผัดไทย", "ส้มตำ", 
    "ข้าวผัด", "ยำวุ้นเส้น", "ไก่ย่าง", "กุ้งแม่น้ำเผา", "หอยนางรมสด",
    "ซูชิ", "ซาชิมิ", "เนื้อวากิว", "แกงเขียวหวาน", "ปูอบวุ้นเส้น",
    "ปลากะพงทอดน้ำปลา", "หมูสามชั้นย่าง", "ข้าวเหนียวมะม่วง", "ไอศกรีม",
    "ซุปมิโซะ", "เนื้อชาบู", "หอยแมลงภู่", "กุ้งทอดกระเทียม"
  ];
  
  // Generate 1-10 items per order (unlimited items)
  const numItems = Math.floor(Math.random() * 10) + 1;
  const items: OrderItem[] = [];
  const usedItems = new Set<string>();
  
  for (let i = 0; i < numItems; i++) {
    let menuItem;
    do {
      menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    } while (usedItems.has(menuItem));
    
    usedItems.add(menuItem);
    items.push({
      menuItem,
      quantity: Math.floor(Math.random() * 5) + 1,
    });
  }
  
  return {
    id: `order-${Date.now()}-${Math.random()}`,
    tableNumber,
    items,
    status: "waiting",
    timestamp: new Date(),
    isNew: true,
  };
};

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [removingOrders, setRemovingOrders] = useState<Set<string>>(new Set());
  const [tableSelectorOpen, setTableSelectorOpen] = useState(false);
  const [tableHistoryOpen, setTableHistoryOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for history
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound (bell sound)
  useEffect(() => {
    audioRef.current = new Audio();
    // Bell notification sound
    audioRef.current.src = "data:audio/wav;base64,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";
  }, []);

  // Simulate receiving new orders
  useEffect(() => {
    const interval = setInterval(() => {
      const tableNumber = Math.floor(Math.random() * 9) + 1;
      const newOrder = generateMockOrder(tableNumber);
      
      setOrders((prev) => [...prev, newOrder]);
      setAllOrders((prev) => [...prev, newOrder]);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
      }
      
      const itemsText = newOrder.items.map(item => `${item.menuItem} (${item.quantity})`).join(", ");
      toast.success("ออเดอร์ใหม่!", {
        description: `โต๊ะ ${tableNumber} - ${itemsText}`,
      });

      // Remove the "new" flag after animation
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === newOrder.id ? { ...order, isNew: false } : order
          )
        );
      }, 2000);
    }, 8000); // New order every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const handleServe = (orderId: string) => {
    setRemovingOrders((prev) => new Set(prev).add(orderId));
    
    // Update status in allOrders for history
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "served" as const } : order
      )
    );

    // Remove from active orders after animation
    setTimeout(() => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setRemovingOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }, 300);
  };

  const handleSelectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setTableHistoryOpen(true);
  };

  const tableOrders = selectedTable
    ? allOrders.filter((order) => order.tableNumber === selectedTable)
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary rounded-lg p-3">
              <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">ระบบแสดงผลออเดอร์ครัว</h1>
              <p className="text-muted-foreground">Kitchen Display System</p>
            </div>
          </div>
          <Button
            onClick={() => setTableSelectorOpen(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-8 py-6 rounded-xl transition-all hover:scale-105"
          >
            <UtensilsCrossed className="mr-2 h-6 w-6" />
            โต๊ะ
          </Button>
        </div>
      </header>

      {/* Orders Queue */}
      <main>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">คิวออเดอร์</h2>
          <div className="text-muted-foreground">
            รายการทั้งหมด: <span className="font-bold text-foreground">{orders.length}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">ไม่มีออเดอร์ในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderStrip
                key={order.id}
                order={order}
                onServe={handleServe}
                isRemoving={removingOrders.has(order.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <TableSelector
        open={tableSelectorOpen}
        onOpenChange={setTableSelectorOpen}
        onSelectTable={handleSelectTable}
      />
      <TableHistory
        open={tableHistoryOpen}
        onOpenChange={setTableHistoryOpen}
        tableNumber={selectedTable}
        orders={tableOrders}
      />
    </div>
  );
};

export default Index;
