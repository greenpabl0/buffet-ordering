import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QuantityModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  itemImage: string;
  onConfirm: (quantity: number) => void;
}

const QuantityModal = ({ open, onClose, itemName, itemImage, onConfirm }: QuantityModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  const handleCancel = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">เลือกจำนวน</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <img 
            src={itemImage} 
            alt={itemName}
            className="w-32 h-32 object-cover rounded-lg"
          />
          
          <p className="font-medium text-center text-foreground">{itemName}</p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-12 w-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            <span className="text-3xl font-bold text-foreground min-w-[3rem] text-center">
              {quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            ตกลง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityModal;
