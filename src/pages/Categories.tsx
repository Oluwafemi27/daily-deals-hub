import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const Categories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("product_categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Categories</h1>
      </header>
      <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-4 md:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : categories.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
                  {cat.icon || "📦"}
                </div>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
      </div>
      {categories.length === 0 && !isLoading && (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <span className="text-4xl">📂</span>
          <p className="mt-2">No categories yet</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
