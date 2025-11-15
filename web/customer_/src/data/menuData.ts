import { MenuItem } from "@/types/menu";

export const menuData: MenuItem[] = [
  // เนื้อ/หมู
  { id: "m1", name: "เนื้อวากิว A5 (พรีเมียม)", category: "meat", image: "/placeholder.svg", price: 199, isPremium: true },
  { id: "m2", name: "เนื้อออสเตรเลีย (พรีเมียม)", category: "meat", image: "/placeholder.svg", price: 99, isPremium: true },
  { id: "m3", name: "หมูสามชั้น", category: "meat", image: "/placeholder.svg", price: 0 },
  { id: "m4", name: "หมูสไลด์", category: "meat", image: "/placeholder.svg", price: 0 },
  { id: "m5", name: "เนื้อสไลด์", category: "meat", image: "/placeholder.svg", price: 0 },
  { id: "m6", name: "หมูบด", category: "meat", image: "/placeholder.svg", price: 0 },

  // ทะเล
  { id: "s1", name: "กุ้งแม่น้ำ (พรีเมียม)", category: "seafood", image: "/placeholder.svg", price: 149, isPremium: true },
  { id: "s2", name: "กุ้งขาว", category: "seafood", image: "/placeholder.svg", price: 0 },
  { id: "s3", name: "ปลาหมึก", category: "seafood", image: "/placeholder.svg", price: 0 },
  { id: "s4", name: "หอยแมลงภู่", category: "seafood", image: "/placeholder.svg", price: 0 },
  { id: "s5", name: "ปลาดอรี่", category: "seafood", image: "/placeholder.svg", price: 0 },
  { id: "s6", name: "ปูอัด", category: "seafood", image: "/placeholder.svg", price: 0 },

  // ผัก
  { id: "v1", name: "ผักบุ้งจีน", category: "vegetables", image: "/placeholder.svg", price: 0 },
  { id: "v2", name: "ผักกาดขาว", category: "vegetables", image: "/placeholder.svg", price: 0 },
  { id: "v3", name: "ต้นหอม", category: "vegetables", image: "/placeholder.svg", price: 0 },
  { id: "v4", name: "เห็ดเข็มทอง", category: "vegetables", image: "/placeholder.svg", price: 0 },
  { id: "v5", name: "เห็ดฟาง", category: "vegetables", image: "/placeholder.svg", price: 0 },
  { id: "v6", name: "ข้าวโพดอ่อน", category: "vegetables", image: "/placeholder.svg", price: 0 },

  // ลูกชิ้น/เส้น
  { id: "b1", name: "ลูกชิ้นปลา", category: "balls", image: "/placeholder.svg", price: 0 },
  { id: "b2", name: "ลูกชิ้นเนื้อ", category: "balls", image: "/placeholder.svg", price: 0 },
  { id: "b3", name: "ลูกชิ้นกุ้ง", category: "balls", image: "/placeholder.svg", price: 0 },
  { id: "b4", name: "เส้นบะหมี่", category: "balls", image: "/placeholder.svg", price: 0 },
  { id: "b5", name: "เส้นอุด้ง", category: "balls", image: "/placeholder.svg", price: 0 },
  { id: "b6", name: "วุ้นเส้น", category: "balls", image: "/placeholder.svg", price: 0 },

  // อาหารทานเล่น (A La Carte)
  { id: "a1", name: "ปีกไก่ทอด", category: "alacarte", image: "/placeholder.svg", price: 89 },
  { id: "a2", name: "เฟรนช์ฟรายส์", category: "alacarte", image: "/placeholder.svg", price: 59 },
  { id: "a3", name: "ข้าวผัดกระเทียม", category: "alacarte", image: "/placeholder.svg", price: 69 },
  { id: "a4", name: "ไก่ทอดคาราอาเกะ", category: "alacarte", image: "/placeholder.svg", price: 79 },

  // ของหวาน
  { id: "d1", name: "ไอศกรีมวานิลลา", category: "desserts", image: "/placeholder.svg", price: 0 },
  { id: "d2", name: "ไอศกรีมช็อกโกแลต", category: "desserts", image: "/placeholder.svg", price: 0 },
  { id: "d3", name: "ไอศกรีมสตรอว์เบอร์รี่", category: "desserts", image: "/placeholder.svg", price: 0 },
  { id: "d4", name: "เค้กช็อกโกแลต", category: "desserts", image: "/placeholder.svg", price: 49 },
];

export const categories = [
  { id: "meat", name: "เนื้อ/หมู" },
  { id: "seafood", name: "ทะเล" },
  { id: "vegetables", name: "ผัก" },
  { id: "balls", name: "ลูกชิ้น/เส้น" },
  { id: "alacarte", name: "ทานเล่น" },
  { id: "desserts", name: "ของหวาน" },
];
