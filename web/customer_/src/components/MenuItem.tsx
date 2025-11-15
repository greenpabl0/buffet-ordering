import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface MenuItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  isPremium?: boolean;
  onAddToCart: (id: string) => void;
}

const MenuItem = ({ id, name, image, price, isPremium, onAddToCart }: MenuItemProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-40 object-cover"
        />
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>
        
        <div className="flex items-center justify-between gap-2 mb-2">
          {price > 0 && (
            <Badge variant="secondary" className="text-xs bg-[hsl(25,90%,55%)] text-white border-0">
              สั่งเพิ่ม
            </Badge>
          )}
          <span className={`font-bold text-sm ml-auto ${price > 0 ? 'text-[hsl(25,90%,55%)]' : 'text-primary'}`}>
            {price > 0 ? `${price.toFixed(2)} บาท` : '0.00 บาท'}
          </span>
        </div>
        
        <Button
          size="sm"
          onClick={() => onAddToCart(id)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          หยิบใส่ตะกร้า
        </Button>
      </div>
    </Card>
  );
};

export default MenuItem;
