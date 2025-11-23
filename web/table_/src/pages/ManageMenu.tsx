import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const ManageMenu = () => {
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  // กำหนดค่าเริ่มต้น category เป็น 'meat'
  const [formData, setFormData] = useState({ name: "", category: "meat", price: "0", is_buffet: true, image_url: "" });

  const { data: menuItems = [], refetch } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/menu");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const handleAdd = async () => {
    try {
        await fetch("http://localhost:5000/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, price: Number(formData.price) })
        });
        toast.success("เพิ่มเมนูสำเร็จ");
        setIsAddOpen(false);
        refetch();
        // Reset form
        setFormData({ name: "", category: "meat", price: "0", is_buffet: true, image_url: "" });
    } catch(e) { toast.error("เพิ่มเมนูไม่สำเร็จ"); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("ยืนยันการลบเมนูนี้?")) return;
    try {
        await fetch(`http://localhost:5000/api/menu/${id}`, { method: "DELETE" });
        toast.success("ลบเมนูสำเร็จ");
        refetch();
    } catch(e) { toast.error("ลบเมนูไม่สำเร็จ"); }
  };

  // รายการหมวดหมู่
  const categories = [
      { value: "meat", label: "เนื้อสัตว์" },
      { value: "seafood", label: "ซีฟู้ด" },
      { value: "vegetables", label: "ผัก" },
      { value: "balls", label: "ลูกชิ้น/เส้น" },
      { value: "alacarte", label: "จานเดี่ยว (A La Carte)" },
      { value: "desserts", label: "ของหวาน" },
      { value: "others", label: "อื่นๆ" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4"/></Button>
                <h1 className="text-3xl font-bold">จัดการเมนูอาหาร</h1>
            </div>
            <Button onClick={() => setIsAddOpen(true)}><Plus className="mr-2 h-4 w-4"/> เพิ่มเมนูใหม่</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item: any) => (
                <Card key={item.menu_id} className="overflow-hidden group relative hover:shadow-md transition-shadow">
                    <div className="relative h-40 bg-slate-100">
                        <img src={item.image_url || "https://placehold.co/300x200"} alt={item.menu_name} className="w-full h-full object-cover"/>
                        <button 
                            onClick={() => handleDelete(item.menu_id)} 
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </button>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-bold truncate text-lg">{item.menu_name}</h3>
                        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                                {categories.find(c => c.value === item.category)?.label || item.category}
                            </span>
                            <span className={item.price > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                                {item.price > 0 ? `${item.price} ฿` : "Buffet"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>เพิ่มเมนูใหม่</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <Label>ชื่อเมนู</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="เช่น เนื้อวากิว" />
                    </div>
                    
                    {/* เปลี่ยนจาก Input เป็น Select */}
                    <div className="grid gap-2">
                        <Label>หมวดหมู่</Label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>URL รูปภาพ</Label>
                        <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <Checkbox id="buffet" checked={formData.is_buffet} onCheckedChange={(c) => setFormData({...formData, is_buffet: c as boolean, price: c ? "0" : formData.price})} />
                        <Label htmlFor="buffet" className="cursor-pointer">รวมในบุฟเฟต์ (ฟรี)</Label>
                    </div>
                    {!formData.is_buffet && (
                        <div className="grid gap-2 animate-in slide-in-from-top-2">
                            <Label className="text-red-500">ราคา (บาท)</Label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
                    <Button onClick={handleAdd}>บันทึก</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageMenu;