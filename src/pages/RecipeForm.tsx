import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { recipeSchema } from "@/lib/validationSchemas";
import { z } from "zod";

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    intent_or_mood: "",
    batch_size_liters: "",
    tea_blend_description: "",
    tea_amount_g_per_liter: "",
    steep_temperature_c: "",
    steep_time_minutes: "",
    sugar_g_per_liter: "",
    sugar_type: "",
    starter_percentage: "",
    starter_notes: "",
    target_f1_days_min: "",
    target_f1_days_max: "",
    target_ph_range: "",
    target_brix_range: "",
    f2_fruit_ideas: "",
    f2_herb_spice_ideas: "",
    f2_sugar_or_juice_guidelines: "",
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || "",
        description: recipe.description || "",
        intent_or_mood: recipe.intent_or_mood || "",
        batch_size_liters: recipe.batch_size_liters?.toString() || "",
        tea_blend_description: recipe.tea_blend_description || "",
        tea_amount_g_per_liter: recipe.tea_amount_g_per_liter?.toString() || "",
        steep_temperature_c: recipe.steep_temperature_c?.toString() || "",
        steep_time_minutes: recipe.steep_time_minutes?.toString() || "",
        sugar_g_per_liter: recipe.sugar_g_per_liter?.toString() || "",
        sugar_type: recipe.sugar_type || "",
        starter_percentage: recipe.starter_percentage?.toString() || "",
        starter_notes: recipe.starter_notes || "",
        target_f1_days_min: recipe.target_f1_days_min?.toString() || "",
        target_f1_days_max: recipe.target_f1_days_max?.toString() || "",
        target_ph_range: recipe.target_ph_range || "",
        target_brix_range: recipe.target_brix_range || "",
        f2_fruit_ideas: recipe.f2_fruit_ideas || "",
        f2_herb_spice_ideas: recipe.f2_herb_spice_ideas || "",
        f2_sugar_or_juice_guidelines: recipe.f2_sugar_or_juice_guidelines || "",
        notes: recipe.notes || "",
      });
    }
  }, [recipe]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        batch_size_liters: data.batch_size_liters ? parseFloat(data.batch_size_liters) : null,
        tea_amount_g_per_liter: data.tea_amount_g_per_liter ? parseFloat(data.tea_amount_g_per_liter) : null,
        steep_temperature_c: data.steep_temperature_c ? parseFloat(data.steep_temperature_c) : null,
        steep_time_minutes: data.steep_time_minutes ? parseInt(data.steep_time_minutes) : null,
        sugar_g_per_liter: data.sugar_g_per_liter ? parseFloat(data.sugar_g_per_liter) : null,
        starter_percentage: data.starter_percentage ? parseFloat(data.starter_percentage) : null,
        target_f1_days_min: data.target_f1_days_min ? parseInt(data.target_f1_days_min) : null,
        target_f1_days_max: data.target_f1_days_max ? parseInt(data.target_f1_days_max) : null,
      };

      if (isEdit) {
        const { error } = await supabase.from("recipes").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("recipes").insert([{ ...payload, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success(isEdit ? "Recipe updated!" : "Recipe created!");
      navigate("/recipes");
    },
    onError: (error) => {
      toast.error("Failed to save recipe: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      const validatedData = recipeSchema.parse({
        ...formData,
        batch_size_liters: formData.batch_size_liters ? parseFloat(formData.batch_size_liters) : undefined,
        tea_amount_g_per_liter: formData.tea_amount_g_per_liter ? parseFloat(formData.tea_amount_g_per_liter) : undefined,
        steep_temperature_c: formData.steep_temperature_c ? parseFloat(formData.steep_temperature_c) : undefined,
        steep_time_minutes: formData.steep_time_minutes ? parseInt(formData.steep_time_minutes) : undefined,
        sugar_g_per_liter: formData.sugar_g_per_liter ? parseFloat(formData.sugar_g_per_liter) : undefined,
        starter_percentage: formData.starter_percentage ? parseFloat(formData.starter_percentage) : undefined,
        target_f1_days_min: formData.target_f1_days_min ? parseInt(formData.target_f1_days_min) : undefined,
        target_f1_days_max: formData.target_f1_days_max ? parseInt(formData.target_f1_days_max) : undefined,
      });
      setValidationErrors({});
      saveMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error('Please fix the validation errors');
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/recipes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Recipe" : "New Recipe"}
            </h2>
            <p className="text-muted-foreground">Define your kombucha brewing template</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Summer Ginger Blend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intent_or_mood">Type/Line</Label>
                  <Select value={formData.intent_or_mood} onValueChange={(v) => handleChange("intent_or_mood", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Signature">Signature</SelectItem>
                      <SelectItem value="Seasonal">Seasonal</SelectItem>
                      <SelectItem value="Speciality">Speciality</SelectItem>
                      <SelectItem value="Experimental">Experimental</SelectItem>
                      <SelectItem value="Starter">Starter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_size_liters">Batch Size (Liters)</Label>
                <Input
                  id="batch_size_liters"
                  type="number"
                  step="0.1"
                  value={formData.batch_size_liters}
                  onChange={(e) => handleChange("batch_size_liters", e.target.value)}
                  placeholder="5.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of this recipe..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tea Preparation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tea_blend_description">Tea Blend Description</Label>
                <Textarea
                  id="tea_blend_description"
                  value={formData.tea_blend_description}
                  onChange={(e) => handleChange("tea_blend_description", e.target.value)}
                  placeholder="70% black, 20% green, 10% oolong"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="tea_amount_g_per_liter">Tea (g/L)</Label>
                  <Input
                    id="tea_amount_g_per_liter"
                    type="number"
                    step="0.1"
                    value={formData.tea_amount_g_per_liter}
                    onChange={(e) => handleChange("tea_amount_g_per_liter", e.target.value)}
                    placeholder="8.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steep_temperature_c">Steep Temp (°C)</Label>
                  <Input
                    id="steep_temperature_c"
                    type="number"
                    step="0.1"
                    value={formData.steep_temperature_c}
                    onChange={(e) => handleChange("steep_temperature_c", e.target.value)}
                    placeholder="85"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steep_time_minutes">Steep Time (min)</Label>
                  <Input
                    id="steep_time_minutes"
                    type="number"
                    value={formData.steep_time_minutes}
                    onChange={(e) => handleChange("steep_time_minutes", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sugar & Starter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sugar_g_per_liter">Sugar (g/L)</Label>
                  <Input
                    id="sugar_g_per_liter"
                    type="number"
                    step="0.1"
                    value={formData.sugar_g_per_liter}
                    onChange={(e) => handleChange("sugar_g_per_liter", e.target.value)}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar_type">Sugar Type</Label>
                  <Input
                    id="sugar_type"
                    value={formData.sugar_type}
                    onChange={(e) => handleChange("sugar_type", e.target.value)}
                    placeholder="White, cane, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="starter_percentage">Starter (%)</Label>
                <Input
                  id="starter_percentage"
                  type="number"
                  step="0.1"
                  value={formData.starter_percentage}
                  onChange={(e) => handleChange("starter_percentage", e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starter_notes">Starter Notes</Label>
                <Textarea
                  id="starter_notes"
                  value={formData.starter_notes}
                  onChange={(e) => handleChange("starter_notes", e.target.value)}
                  placeholder="Notes about starter preparation..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fermentation Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target_f1_days_min">F1 Days (Min)</Label>
                  <Input
                    id="target_f1_days_min"
                    type="number"
                    value={formData.target_f1_days_min}
                    onChange={(e) => handleChange("target_f1_days_min", e.target.value)}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_f1_days_max">F1 Days (Max)</Label>
                  <Input
                    id="target_f1_days_max"
                    type="number"
                    value={formData.target_f1_days_max}
                    onChange={(e) => handleChange("target_f1_days_max", e.target.value)}
                    placeholder="14"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target_ph_range">Target pH Range</Label>
                  <Input
                    id="target_ph_range"
                    value={formData.target_ph_range}
                    onChange={(e) => handleChange("target_ph_range", e.target.value)}
                    placeholder="3.0-3.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_brix_range">Target Brix Range</Label>
                  <Input
                    id="target_brix_range"
                    value={formData.target_brix_range}
                    onChange={(e) => handleChange("target_brix_range", e.target.value)}
                    placeholder="5-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>F2 Suggestions</CardTitle>
              <CardDescription>Ideas for secondary fermentation flavors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="f2_fruit_ideas">Fruit Ideas</Label>
                <Textarea
                  id="f2_fruit_ideas"
                  value={formData.f2_fruit_ideas}
                  onChange={(e) => handleChange("f2_fruit_ideas", e.target.value)}
                  placeholder="Raspberry, blueberry, mango..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f2_herb_spice_ideas">Herb & Spice Ideas</Label>
                <Textarea
                  id="f2_herb_spice_ideas"
                  value={formData.f2_herb_spice_ideas}
                  onChange={(e) => handleChange("f2_herb_spice_ideas", e.target.value)}
                  placeholder="Ginger, mint, hibiscus..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f2_sugar_or_juice_guidelines">Sugar/Juice Guidelines</Label>
                <Textarea
                  id="f2_sugar_or_juice_guidelines"
                  value={formData.f2_sugar_or_juice_guidelines}
                  onChange={(e) => handleChange("f2_sugar_or_juice_guidelines", e.target.value)}
                  placeholder="Add 1-2g sugar per bottle for carbonation..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional notes about this recipe..."
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Update Recipe" : "Create Recipe"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/recipes")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RecipeForm;
