import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, BookOpen, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

const Recipes = () => {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Recipes</h2>
            <p className="text-muted-foreground">Your kombucha recipe templates</p>
          </div>
          <Button asChild>
            <Link to="/recipes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Link>
          </Button>
        </div>

        {recipes && recipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{recipe.name}</CardTitle>
                      <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    {recipe.intent_or_mood && (
                      <Badge variant="secondary" className="w-fit">
                        {recipe.intent_or_mood}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {recipe.description && (
                        <p className="text-muted-foreground line-clamp-2">{recipe.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {recipe.batch_size_liters && (
                          <span className="bg-muted px-2 py-1 rounded">
                            {recipe.batch_size_liters}L batch
                          </span>
                        )}
                        {recipe.target_f1_days_max && (
                          <span className="bg-muted px-2 py-1 rounded">
                            {recipe.target_f1_days_max} days F1
                          </span>
                        )}
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
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No recipes yet</p>
              <Button asChild>
                <Link to="/recipes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Recipe
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;
