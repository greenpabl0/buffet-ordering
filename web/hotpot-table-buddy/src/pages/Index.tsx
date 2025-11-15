import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PriceInfo from "@/components/PriceInfo";
import CategoryTabs from "@/components/CategoryTabs";
import MenuItem from "@/components/MenuItem";
import QuantityModal from "@/components/QuantityModal";
import CartSummary from "@/components/CartSummary";
import { menuData, categories } from "@/data/menuData";
import { CartItem } from "@/types/menu";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("meat");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredMenu = menuData.filter(item => item.category === activeCategory);
  const selectedMenuItem = menuData.find(item => item.id === selectedItem);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddToCart = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleConfirmQuantity = (quantity: number) => {
    if (!selectedMenuItem) return;

    const existingItem = cart.find(item => item.id === selectedMenuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === selectedMenuItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...selectedMenuItem, quantity }]);
    }

    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${selectedMenuItem.name} x${quantity}`,
    });

    setSelectedItem(null);
  };

  const handleCheckout = () => {
    // Store cart in localStorage for access in cart page
    localStorage.setItem('currentCart', JSON.stringify(cart));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-4">
        <PriceInfo />
        
        <div className="mb-4">
          <CategoryTabs 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredMenu.map((item) => (
            <MenuItem
              key={item.id}
              {...item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>

      {totalItems > 0 && (
        <CartSummary
          totalItems={totalItems}
          totalPrice={totalPrice}
          onCheckout={handleCheckout}
        />
      )}

      <BottomNav />

      {selectedMenuItem && (
        <QuantityModal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          itemName={selectedMenuItem.name}
          itemImage={selectedMenuItem.image}
          onConfirm={handleConfirmQuantity}
        />
      )}
    </div>
  );
};

export default Index;
