import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TestTubes, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const F2Variants = () => {
  const { data: variants, isLoading } = useQuery({
    queryKey: ["f2-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("f2_variant_batches")
        .select("*, batches(batch_code)")
        .order("f2_start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      fermenting: "bg-info text-info-foreground",
      cold_crash: "bg-accent text-accent-foreground",
      ready: "bg-success text-success-foreground",
      consumed: "bg-muted text-muted-foreground",
      failed: "bg-destructive text-destructive-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">F2 Variants</h2>
          <p className="text-muted-foreground">Flavored kombucha variations</p>
        </div>

        {variants && variants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => (
              <Link key={variant.id} to={`/f2-variants/${variant.id}`}>
                <Card className="hover:border-secondary transition-colors h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {variant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {variant.batches?.batch_code || "Unknown batch"}
                        </p>
                      </div>
                      <TestTubes className="h-5 w-5 text-secondary flex-shrink-0" />
                    </div>

                    <div className="space-y-2 mb-3">
                      <Badge className={getStatusColor(variant.f2_status)}>
                        {variant.f2_status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {variant.bottle_count} × {variant.bottle_size_liters}L bottles
                        </p>
                        <p className="text-xs mt-1">
                          Started: {format(new Date(variant.f2_start_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {variant.tasting_rating && (
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-semibold">{variant.tasting_rating}/10</span>
                      </div>
                    )}

                    {(variant.fruits_and_juices || variant.herbs_and_spices) && (
                      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                        {variant.fruits_and_juices && (
                          <p className="truncate">🍓 {variant.fruits_and_juices}</p>
                        )}
                        {variant.herbs_and_spices && (
                          <p className="truncate">🌿 {variant.herbs_and_spices}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TestTubes className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No F2 variants yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create F2 variants from your batches
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default F2Variants;
