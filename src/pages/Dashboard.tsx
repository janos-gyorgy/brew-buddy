import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Batch, F2Variant } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Droplets, TestTube } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const { data: activeBatches, isLoading: batchesLoading } = useQuery({
    queryKey: ["active-batches"],
    queryFn: () => api.get<Batch[]>('/batches/active'),
  });

  const { data: activeF2Variants, isLoading: f2Loading } = useQuery({
    queryKey: ["active-f2-variants"],
    queryFn: () => api.get<F2Variant[]>('/f2-variants/active'),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      fermenting_f1: "bg-info text-info-foreground",
      ready_for_f2: "bg-warning text-warning-foreground",
      fermenting_f2: "bg-info text-info-foreground",
      fermenting: "bg-info text-info-foreground",
      cold_crash: "bg-accent text-accent-foreground",
      ready: "bg-success text-success-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const isAttentionNeeded = (date: Date | null) => {
    if (!date) return false;
    return isToday(date) || isPast(date);
  };

  if (batchesLoading || f2Loading) {
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
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Active batches and action items</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                Active F1 Batches
              </CardTitle>
              <CardDescription>Currently fermenting primary batches</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBatches && activeBatches.length > 0 ? (
                <div className="space-y-3">
                  {activeBatches.map((batch) => {
                    const needsAttention = batch.target_ready_date_f1
                      ? isAttentionNeeded(new Date(batch.target_ready_date_f1))
                      : false;

                    return (
                      <Link
                        key={batch.id}
                        to={`/batches/${batch.id}`}
                        className="block p-4 rounded-lg border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground truncate">
                                {batch.batch_code}
                              </p>
                              {needsAttention && (
                                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {batch.recipes?.name || "No recipe"}
                            </p>
                            {batch.target_ready_date_f1 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Target: {format(new Date(batch.target_ready_date_f1), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No active F1 batches</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-secondary" />
                Active F2 Variants
              </CardTitle>
              <CardDescription>Currently fermenting flavored variants</CardDescription>
            </CardHeader>
            <CardContent>
              {activeF2Variants && activeF2Variants.length > 0 ? (
                <div className="space-y-3">
                  {activeF2Variants.map((variant) => {
                    const needsAttention = variant.expected_ready_date_f2
                      ? isAttentionNeeded(new Date(variant.expected_ready_date_f2))
                      : false;

                    return (
                      <Link
                        key={variant.id}
                        to={`/f2-variants/${variant.id}`}
                        className="block p-4 rounded-lg border border-border hover:border-secondary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground truncate">{variant.name}</p>
                              {needsAttention && (
                                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              From: {variant.batches?.batch_code || "Unknown batch"}
                            </p>
                            {variant.expected_ready_date_f2 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Expected: {format(new Date(variant.expected_ready_date_f2), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(variant.f2_status)}>
                            {variant.f2_status}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No active F2 variants</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
