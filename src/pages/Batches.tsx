import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Batches = () => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*, recipes(name)")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-muted text-muted-foreground",
      fermenting_f1: "bg-info text-info-foreground",
      ready_for_f2: "bg-warning text-warning-foreground",
      fermenting_f2: "bg-info text-info-foreground",
      cold_crash: "bg-accent text-accent-foreground",
      bottled: "bg-secondary text-secondary-foreground",
      finished: "bg-success text-success-foreground",
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Batches</h2>
            <p className="text-muted-foreground">Track your kombucha batches</p>
          </div>
          <Button asChild>
            <Link to="/batches/new">
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Link>
          </Button>
        </div>

        {batches && batches.length > 0 ? (
          <div className="space-y-3">
            {batches.map((batch) => (
              <Link key={batch.id} to={`/batches/${batch.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <FlaskConical className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {batch.batch_code}
                          </h3>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{batch.recipes?.name || "No recipe"}</span>
                          <span>•</span>
                          <span>{batch.total_volume_liters}L</span>
                          <span>•</span>
                          <span>{format(new Date(batch.start_date), "MMM d, yyyy")}</span>
                          {batch.vessel_location && (
                            <>
                              <span>•</span>
                              <span>{batch.vessel_location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No batches yet</p>
              <Button asChild>
                <Link to="/batches/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Batch
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Batches;
