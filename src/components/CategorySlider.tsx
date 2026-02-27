import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, ChevronRight } from "lucide-react";

const CategorySlider = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("product_categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center gap-1 rounded-xl bg-card p-3 shadow-sm">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="text-lg font-bold">All Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-2">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              : categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl">
                      {cat.icon || "📦"}
                    </div>
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
            {categories.length === 0 && !isLoading && (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <span className="text-3xl">📂</span>
                <p className="mt-2 text-sm">No categories yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CategorySlider;
