import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, Trash2, Plus, FlaskConical } from "lucide-react";
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

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: batches } = useQuery({
    queryKey: ["recipe-batches", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("recipe_id", id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe deleted");
      navigate("/recipes");
    },
    onError: (error) => {
      toast.error("Failed to delete recipe: " + error.message);
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

  if (!recipe) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recipe not found</p>
          <Button className="mt-4" onClick={() => navigate("/recipes")}>
            Back to Recipes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/recipes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{recipe.name}</h2>
              {recipe.intent_or_mood && (
                <Badge variant="secondary" className="mt-2">
                  {recipe.intent_or_mood}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/recipes/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this recipe. Existing batches will not be affected.
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

        {recipe.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{recipe.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {recipe.element && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Element</p>
                  <p className="text-foreground">{recipe.element}</p>
                </div>
              )}
              {recipe.batch_size_liters && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch Size</p>
                  <p className="text-foreground">{recipe.batch_size_liters}L</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tea Preparation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recipe.tea_blend_description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tea Blend</p>
                <p className="text-foreground">{recipe.tea_blend_description}</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              {recipe.tea_amount_g_per_liter && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tea Amount</p>
                  <p className="text-foreground">{recipe.tea_amount_g_per_liter}g/L</p>
                </div>
              )}
              {recipe.steep_temperature_c && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Steep Temp</p>
                  <p className="text-foreground">{recipe.steep_temperature_c}°C</p>
                </div>
              )}
              {recipe.steep_time_minutes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Steep Time</p>
                  <p className="text-foreground">{recipe.steep_time_minutes} min</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sugar & Starter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              {recipe.sugar_g_per_liter && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sugar Amount</p>
                  <p className="text-foreground">{recipe.sugar_g_per_liter}g/L</p>
                </div>
              )}
              {recipe.sugar_type && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sugar Type</p>
                  <p className="text-foreground">{recipe.sugar_type}</p>
                </div>
              )}
              {recipe.starter_percentage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Starter Percentage</p>
                  <p className="text-foreground">{recipe.starter_percentage}%</p>
                </div>
              )}
            </div>
            {recipe.starter_notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Starter Notes</p>
                <p className="text-foreground">{recipe.starter_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fermentation Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              {(recipe.target_f1_days_min || recipe.target_f1_days_max) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">F1 Duration</p>
                  <p className="text-foreground">
                    {recipe.target_f1_days_min || "?"} - {recipe.target_f1_days_max || "?"} days
                  </p>
                </div>
              )}
              {recipe.target_ph_range && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target pH</p>
                  <p className="text-foreground">{recipe.target_ph_range}</p>
                </div>
              )}
              {recipe.target_brix_range && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target Brix</p>
                  <p className="text-foreground">{recipe.target_brix_range}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {(recipe.f2_fruit_ideas || recipe.f2_herb_spice_ideas || recipe.f2_sugar_or_juice_guidelines) && (
          <Card>
            <CardHeader>
              <CardTitle>F2 Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.f2_fruit_ideas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fruit Ideas</p>
                  <p className="text-foreground">{recipe.f2_fruit_ideas}</p>
                </div>
              )}
              {recipe.f2_herb_spice_ideas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Herb & Spice Ideas</p>
                  <p className="text-foreground">{recipe.f2_herb_spice_ideas}</p>
                </div>
              )}
              {recipe.f2_sugar_or_juice_guidelines && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sugar/Juice Guidelines</p>
                  <p className="text-foreground">{recipe.f2_sugar_or_juice_guidelines}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {recipe.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{recipe.notes}</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Batches Using This Recipe</CardTitle>
                <CardDescription>History of brews from this template</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/batches/new?recipe=${id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Batch
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {batches && batches.length > 0 ? (
              <div className="space-y-2">
                {batches.map((batch) => (
                  <Link
                    key={batch.id}
                    to={`/batches/${batch.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{batch.batch_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.total_volume_liters}L • {batch.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No batches yet. Start your first batch from this recipe!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecipeDetail;
