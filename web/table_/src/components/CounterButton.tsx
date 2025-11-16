import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CounterButtonProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CounterButton({ value, onChange, min = 0, max = 99 }: CounterButtonProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-12 w-12 rounded-full border-2 border-primary hover:bg-primary/10"
      >
        <Minus className="h-5 w-5 text-primary" />
      </Button>
      <span className="text-3xl font-semibold min-w-[3rem] text-center">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-12 w-12 rounded-full border-2 border-primary hover:bg-primary/10"
      >
        <Plus className="h-5 w-5 text-primary" />
      </Button>
    </div>
  );
}
