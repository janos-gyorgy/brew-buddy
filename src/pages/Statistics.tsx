import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, FlaskConical, TestTubes, TrendingUp, Award, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Statistics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const [recipes, batches, f2Variants, fermentationLogs] = await Promise.all([
        supabase.from("recipes").select("*"),
        supabase.from("batches").select("*"),
        supabase.from("f2_variant_batches").select("*"),
        supabase.from("fermentation_log_entries").select("*"),
      ]);

      const totalRecipes = recipes.data?.length || 0;
      const totalBatches = batches.data?.length || 0;
      const totalF2Variants = f2Variants.data?.length || 0;
      const totalLogs = fermentationLogs.data?.length || 0;

      const activeBatches = batches.data?.filter((b) =>
        ["fermenting_f1", "ready_for_f2", "fermenting_f2"].includes(b.status)
      ).length || 0;

      const finishedBatches = batches.data?.filter((b) => b.status === "finished").length || 0;
      const failedBatches = batches.data?.filter((b) => b.status === "failed").length || 0;
      const successRate = totalBatches > 0 ? ((finishedBatches / totalBatches) * 100).toFixed(1) : "0";

      const totalVolume = batches.data?.reduce((sum, b) => sum + (b.total_volume_liters || 0), 0) || 0;

      const topRatedVariants = f2Variants.data
        ?.filter((v) => v.tasting_rating !== null)
        .sort((a, b) => (b.tasting_rating || 0) - (a.tasting_rating || 0))
        .slice(0, 5);

      const batchesByStatus = batches.data?.reduce((acc, batch) => {
        acc[batch.status] = (acc[batch.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate volume over time
      const volumeOverTime = batches.data
        ?.filter((b) => b.start_date && b.total_volume_liters)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .reduce((acc, batch) => {
          const date = new Date(batch.start_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          const existingEntry = acc.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.volume += batch.total_volume_liters;
          } else {
            const previousVolume = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
            acc.push({
              date,
              volume: batch.total_volume_liters,
              cumulative: previousVolume + batch.total_volume_liters,
            });
          }
          return acc;
        }, [] as { date: string; volume: number; cumulative: number }[]) || [];

      return {
        totalRecipes,
        totalBatches,
        totalF2Variants,
        totalLogs,
        activeBatches,
        finishedBatches,
        failedBatches,
        successRate,
        totalVolume,
        topRatedVariants,
        batchesByStatus,
        volumeOverTime,
      };
    },
  });

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
          <h2 className="text-3xl font-bold text-foreground">Statistics</h2>
          <p className="text-muted-foreground">Your brewing insights and analytics</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecipes}</div>
              <p className="text-xs text-muted-foreground">Recipe templates created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBatches}</div>
              <p className="text-xs text-muted-foreground">{stats?.activeBatches} currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">F2 Variants</CardTitle>
              <TestTubes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalF2Variants}</div>
              <p className="text-xs text-muted-foreground">Flavor experiments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.finishedBatches} finished, {stats?.failedBatches} failed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Volume Produced</CardTitle>
              <CardDescription>Cumulative production across all batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{stats?.totalVolume.toFixed(1)}L</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average: {stats && stats.totalBatches > 0 ? (stats.totalVolume / stats.totalBatches).toFixed(1) : 0}L per batch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fermentation Logs</CardTitle>
              <CardDescription>Total monitoring entries recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">{stats?.totalLogs}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average: {stats && stats.totalBatches > 0 ? (stats.totalLogs / stats.totalBatches).toFixed(1) : 0} logs per batch
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Batches by Status
            </CardTitle>
            <CardDescription>Current distribution of all batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats?.batchesByStatus &&
                Object.entries(stats.batchesByStatus).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className="text-sm">
                    {status.replace(/_/g, " ")}: {count}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        {stats?.volumeOverTime && stats.volumeOverTime.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Brewing Volume Over Time
              </CardTitle>
              <CardDescription>Cumulative liters brewed by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Liters', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Total Liters"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {stats?.topRatedVariants && stats.topRatedVariants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-warning" />
                Top Rated F2 Variants
              </CardTitle>
              <CardDescription>Your highest rated flavor experiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topRatedVariants.map((variant, index) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        {variant.fruits_and_juices && (
                          <p className="text-xs text-muted-foreground">{variant.fruits_and_juices}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{variant.tasting_rating}</span>
                      <span className="text-sm text-muted-foreground">/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;
