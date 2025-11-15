import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-card/50">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
