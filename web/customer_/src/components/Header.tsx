import { Button } from "@/components/ui/button";

interface HeaderProps {
  tableNumber?: number;
}

const Header = ({ tableNumber = 13 }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary shadow-md">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
              🔥
            </div>
            <div>
              <h1 className="font-bold text-lg text-secondary-foreground">Hot Pot Buffet</h1>
              <p className="text-xs text-secondary-foreground/80">โต๊ะที่: {tableNumber}</p>
            </div>
          </div>
          
          
        </div>
      </div>
    </header>
  );
};

export default Header;