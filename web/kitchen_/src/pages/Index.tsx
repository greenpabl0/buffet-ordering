import { useState, useEffect } from "react";
import { UtensilsCrossed, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

// --- Interfaces ---

interface OrderItem {
  id?: number;
  menuItem: string;
  quantity: number;
  status: string;
}

interface Order {
  id: string;
  tableNumber: number;
  status: string;
  timestamp: Date;
  items: OrderItem[];
  isNew?: boolean;
}

// --- Inline Components ---

// Simple Button Component
const Button = ({ className, children, onClick, disabled, size = "default", variant = "primary" }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  
  // Note: Assuming Tailwind classes are available globally
  const variantClass = variants[variant as keyof typeof variants] || variants.primary;
  const sizeClass = sizes[size as keyof typeof sizes] || sizes.default;

  return (
    <button 
      className={`${baseStyle} ${variantClass} ${sizeClass} ${className || ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// OrderStrip Component
const OrderStrip = ({ order, onServe }: { order: Order; onServe: (id: string) => void }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-card rounded-lg border-2 border-border p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        {/* Table Number */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="bg-primary rounded-lg px-6 py-3 min-w-[100px] text-center text-white">
            <div className="text-xs opacity-80 font-medium">Table</div>
            <div className="text-4xl font-bold">{order.tableNumber}</div>
          </div>
          <div className="md:hidden">
            <span className="font-semibold text-lg">
                {order.timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{order.timestamp.toLocaleTimeString('th-TH')}</span>
                    {/* Time elapsed logic could go here */}
                </div>
                <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider">
                    {order.status}
                </div>
            </div>

            <div className="space-y-2 bg-secondary/20 p-4 rounded-md">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-foreground font-bold w-8 h-8 flex items-center justify-center rounded border shadow-sm">
                                {item.quantity}
                            </div>
                            <span className="text-lg font-medium">{item.menuItem}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-3 flex justify-between items-center text-sm text-muted-foreground">
                 <span>Total Items: {totalItems}</span>
            </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0 w-full md:w-auto self-stretch flex flex-col justify-center">
            <Button 
                onClick={() => onServe(order.id)}
                size="lg"
                className="w-full h-full min-h-[80px] text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
            >
                <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="w-8 h-8" />
                    <span>SERVE ALL</span>
                </div>
            </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Polling fetch
  useEffect(() => {
    const fetchOrders = async () => {
        try {
            // Using localhost:5000 as configured in docker-compose
            const res = await fetch("http://localhost:5000/api/kitchen/pending");
            if(res.ok) {
                const data = await res.json();
                // Convert timestamp string to Date object
                const formatted = data.map((o: any) => ({ 
                    ...o, 
                    timestamp: new Date(o.timestamp),
                    // Ensure items is an array
                    items: o.items || [] 
                }));
                setOrders(formatted);
            }
        } catch (e) { 
            console.error("Connection error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleServe = async (orderId: string) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders(prev => prev.filter(o => o.id !== orderId));

    try {
        const res = await fetch(`http://localhost:5000/api/kitchen/serve/${orderId}`, { method: "PUT" });
        if (res.ok) {
            toast.success("Order served!");
        } else {
            throw new Error("Failed");
        }
    } catch (e) { 
        toast.error("Failed to update status");
        setOrders(previousOrders); // Rollback
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      <header className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-lg p-3 text-white shadow-blue-200 shadow-lg">
                <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Kitchen Display System</h1>
                <p className="text-slate-500 text-sm">Real-time Orders</p>
            </div>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold">Live</span>
         </div>
      </header>

      <main className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
        {isLoading && orders.length === 0 ? (
             <div className="text-center py-20 text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                <UtensilsCrossed className="w-16 h-16 mb-4 opacity-20" />
                <div className="text-xl font-medium">No Pending Orders</div>
                <p>Waiting for new orders...</p>
            </div>
        ) : (
            orders.map(order => (
                <OrderStrip key={order.id} order={order} onServe={handleServe} />
            ))
        )}
      </main>
    </div>
  );
};

export default Index;