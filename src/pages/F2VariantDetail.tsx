import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

type F2Status = Database["public"]["Enums"]["f2_status"];

const F2VariantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: variant, isLoading } = useQuery({
    queryKey: ["f2-variant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("f2_variant_batches")
        .select("*, batches(batch_code, recipe_id, recipes(name))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: F2Status) => {
      const { error } = await supabase
        .from("f2_variant_batches")
        .update({ f2_status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f2-variant", id] });
      queryClient.invalidateQueries({ queryKey: ["f2-variants"] });
      toast.success("Status updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("f2_variant_batches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f2-variants"] });
      toast.success("F2 variant deleted");
      navigate("/f2-variants");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
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

  if (!variant) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">F2 variant not found</p>
          <Button className="mt-4" onClick={() => navigate("/f2-variants")}>
            Back to F2 Variants
          </Button>
        </div>
      </Layout>
    );
  }

  const totalVolume = variant.bottle_count * variant.bottle_size_liters;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/f2-variants")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{variant.name}</h2>
              <Badge variant="secondary" className="mt-2 capitalize">
                {variant.f2_status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete F2 Variant?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{variant.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Parent Batch</div>
                <Link to={`/batches/${variant.parent_batch_id}`}>
                  <Button variant="link" className="p-0 h-auto text-foreground">
                    {variant.batches?.batch_code || "Unknown"}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Recipe</div>
                <div className="font-medium">
                  {variant.batches?.recipes?.name || "No recipe"}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">F2 Start Date</div>
                <div className="font-medium">{format(new Date(variant.f2_start_date), "MMM d, yyyy")}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expected Ready</div>
                <div className="font-medium">
                  {variant.expected_ready_date_f2
                    ? format(new Date(variant.expected_ready_date_f2), "MMM d, yyyy")
                    : "Not set"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Select value={variant.f2_status} onValueChange={(v) => updateStatusMutation.mutate(v as F2Status)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fermenting">Fermenting</SelectItem>
                    <SelectItem value="cold_crash">Cold Crash</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="consumed">Consumed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume & Bottles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-2xl font-bold">{totalVolume.toFixed(2)}L</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bottle Count</div>
              <div className="text-2xl font-bold">{variant.bottle_count}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bottle Size</div>
              <div className="text-2xl font-bold">{variant.bottle_size_liters}L</div>
            </div>
          </CardContent>
        </Card>

        {variant.priming_sugar_g_per_bottle && (
          <Card>
            <CardHeader>
              <CardTitle>Priming Sugar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{variant.priming_sugar_g_per_bottle}g per bottle</div>
              <div className="text-sm text-muted-foreground mt-1">
                Total: {(variant.priming_sugar_g_per_bottle * variant.bottle_count).toFixed(1)}g
              </div>
            </CardContent>
          </Card>
        )}

        {(variant.fruits_and_juices || variant.herbs_and_spices || variant.other_additives) && (
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variant.fruits_and_juices && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Fruits & Juices</div>
                  <div className="mt-1">{variant.fruits_and_juices}</div>
                </div>
              )}
              {variant.herbs_and_spices && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Herbs & Spices</div>
                  <div className="mt-1">{variant.herbs_and_spices}</div>
                </div>
              )}
              {variant.other_additives && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Other Additives</div>
                  <div className="mt-1">{variant.other_additives}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(variant.tasting_rating || variant.tasting_notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Tasting Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variant.tasting_rating && (
                <div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="text-2xl font-bold">{variant.tasting_rating}/10</div>
                </div>
              )}
              {variant.tasting_notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="mt-1 whitespace-pre-wrap">{variant.tasting_notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default F2VariantDetail;
