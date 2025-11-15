import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

const PriceInfo = () => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 p-4 mb-4">
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm text-foreground">
          <div className="flex justify-between items-center">
            <span className="font-medium">บุฟเฟต์ผู้ใหญ่:</span>
            <span className="font-bold text-primary">219 บาท</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">น้ำรีฟิล (บังคับทุกคน):</span>
            <span className="font-bold text-primary">69 บาท/ท่าน</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">บุฟเฟต์เด็ก:</span>
            <span className="font-bold text-primary">119 บาท</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * เด็ก: ส่วนสูงไม่เกิน 130 ซม. หรืออายุไม่เกิน 10 ปี | น้ำรีฟีลคิดทุกคน (ผู้ใหญ่+เด็ก)
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PriceInfo;
