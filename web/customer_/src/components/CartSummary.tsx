import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
  onCheckout: () => void;
}

const CartSummary = ({ totalItems, totalPrice, onCheckout }: CartSummaryProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t-2 border-primary shadow-lg z-50">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-secondary-foreground">
            <div className="flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5" />
              <span className="font-semibold">จำนวน:</span>
              <span className="font-bold text-lg">{totalItems}</span>
            </div>
            
            <div className="h-6 w-px bg-secondary-foreground/30" />
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">ยอดรวม:</span>
              <span className="font-bold text-lg">{totalPrice.toFixed(2)} บาท</span>
            </div>
          </div>
          
          <Button 
            onClick={onCheckout}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
          >
            ตรวจสอบรายการ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;