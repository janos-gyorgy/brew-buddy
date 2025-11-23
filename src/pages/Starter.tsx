import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Droplets } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Starter = () => {
  const { data: starters, isLoading } = useQuery({
    queryKey: ["starters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("starter_log")
        .select("*")
        .order("creation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-success text-success-foreground",
      low_volume: "bg-warning text-warning-foreground",
      retired: "bg-muted text-muted-foreground",
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
            <h2 className="text-3xl font-bold text-foreground">Starter Log</h2>
            <p className="text-muted-foreground">Track your kombucha starters</p>
          </div>
        </div>

        {starters && starters.length > 0 ? (
          <div className="space-y-3">
            {starters.map((starter) => (
              <Card key={starter.id} className="hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Droplets className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">
                          {starter.name}
                        </h3>
                        <Badge className={getStatusColor(starter.status)}>
                          {starter.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Created: {format(new Date(starter.creation_date), "MMM d, yyyy")}</span>
                        {starter.current_ph && (
                          <>
                            <span>•</span>
                            <span>pH: {starter.current_ph}</span>
                          </>
                        )}
                        {starter.sugar_g_per_liter && (
                          <>
                            <span>•</span>
                            <span>{starter.sugar_g_per_liter}g/L sugar</span>
                          </>
                        )}
                      </div>
                      {starter.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {starter.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No starters logged yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Starter management is tracked separately from batches and statistics. 
                Demo data includes starter entries for reference.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Starter;
