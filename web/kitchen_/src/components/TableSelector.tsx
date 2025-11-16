import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TableSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTable: (tableNumber: number) => void;
}

export const TableSelector = ({ open, onOpenChange, onSelectTable }: TableSelectorProps) => {
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground text-center">เลือกโต๊ะ</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-6">
          {tables.map((table) => (
            <Button
              key={table}
              onClick={() => {
                onSelectTable(table);
                onOpenChange(false);
              }}
              className="h-32 bg-secondary hover:bg-primary hover:scale-105 transition-all rounded-xl"
            >
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">โต๊ะ</div>
                <div className="text-5xl font-bold text-foreground">{table}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
