import { useState, useEffect } from "react";
import { UtensilsCrossed, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

// Inline Components
const Button = ({ className, children, onClick, disabled, variant="primary" }: any) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 active:scale-95";
  const variants: any = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    outline: "border border-input hover:bg-accent",
  };
  return <button className={`${base} ${variants[variant]} h-10 px-4 py-2 ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
};

const OrderStrip = ({ batch, onServe }: any) => {
  // คำนวณเวลารอ
  const [timeElapsed, setTimeElapsed] = useState("");

  useEffect(() => {
    const updateTime = () => {
        const diff = Math.floor((new Date().getTime() - new Date(batch.timestamp).getTime()) / 60000);
        setTimeElapsed(`${diff} นาที`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [batch.timestamp]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden animate-in slide-in-from-bottom-2 flex flex-col md:flex-row">
      {/* Left: Table Info */}
      <div className="bg-slate-800 text-white p-4 flex flex-col items-center justify-center min-w-[120px] md:border-r border-slate-700">
          <div className="text-xs opacity-70 uppercase font-bold tracking-wider">Table</div>
          <div className="text-5xl font-bold leading-none my-2">{batch.tableNumber}</div>
          <div className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeElapsed}
          </div>
      </div>

      {/* Center: Order Items */}
      <div className="flex-1 p-4 bg-slate-50">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
             <div className="text-xs text-slate-500 font-mono">ID: {batch.id.split('_')[0]}</div>
             <div className="text-xs text-slate-500">{new Date(batch.timestamp).toLocaleTimeString('th-TH')}</div>
          </div>
          <div className="space-y-2">
            {batch.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start bg-white p-2 rounded border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 min-w-[2rem] h-8 flex items-center justify-center rounded font-bold text-lg">
                            {item.quantity}
                        </span>
                        <span className="font-medium text-slate-700 text-lg">{item.menuItem}</span>
                    </div>
                    {item.note && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">*{item.note}</span>}
                </div>
            ))}
          </div>
      </div>

      {/* Right: Action */}
      <div className="p-4 bg-slate-50 flex items-center justify-center md:w-40 border-t md:border-t-0 md:border-l border-slate-200">
          <Button onClick={() => onServe(batch)} className="w-full h-full min-h-[60px] text-lg font-bold flex flex-col items-center justify-center gap-1">
                <CheckCircle className="w-6 h-6" />
                <span>เสิร์ฟ</span>
          </Button>
      </div>
    </div>
  );
};

const Index = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/kitchen/pending");
            if(res.ok) {
                setBatches(await res.json());
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (e) { 
            console.error(e); 
            setIsConnected(false);
        }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, []);

  const handleServe = async (batch: any) => {
    // Optimistic update: ลบออกจากหน้าจอทันทีเพื่อให้รู้ว่ากดแล้ว
    const originalBatches = [...batches];
    setBatches(prev => prev.filter(b => b.id !== batch.id));

    const ids = batch.items.map((i: any) => i.id);
    try {
        // *** จุดที่แก้ไข: เปลี่ยน URL ให้ตรงกับ Backend ใหม่ ***
        const res = await fetch(`http://localhost:5000/api/kitchen/serve/batch/${batch.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
        });

        if (!res.ok) throw new Error("Failed");
        toast.success(`เสิร์ฟโต๊ะ ${batch.tableNumber} เรียบร้อย`);
    } catch (e) { 
        toast.error("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้");
        setBatches(originalBatches); // Rollback ถ้า Error
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
      <header className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-200"><UtensilsCrossed className="w-6 h-6"/></div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Kitchen Display System</h1>
                <p className="text-slate-500 text-sm">ระบบจัดการออเดอร์ครัว</p>
            </div>
         </div>
         <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? "Online" : "Offline"}
         </div>
      </header>

      <div className="grid gap-4 max-w-5xl mx-auto">
        {batches.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center text-slate-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4"><CheckCircle className="w-12 h-12 text-green-500 opacity-50"/></div>
                <h2 className="text-xl font-semibold text-slate-600">ไม่มีออเดอร์ค้าง</h2>
                <p>รายการอาหารทั้งหมดถูกเสิร์ฟแล้ว</p>
            </div>
        ) : (
            batches.map(b => <OrderStrip key={b.id} batch={b} onServe={handleServe} />)
        )}
      </div>
    </div>
  );
};

export default Index;