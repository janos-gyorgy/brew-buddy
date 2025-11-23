import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { format } from "date-fns";
import { batchSchema } from "@/lib/validationSchemas";
import { z } from "zod";

const BatchForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get("recipe");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    batch_code: "",
    recipe_id: recipeId || "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    status: "planned",
    total_volume_liters: "",
    vessel_type: "",
    vessel_location: "",
    initial_ph: "",
    initial_brix: "",
    ambient_temperature_c: "",
    target_ready_date_f1: "",
    starter_source: "",
    scoby_info: "",
    general_notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: recipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("recipes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: selectedRecipe } = useQuery({
    queryKey: ["recipe", formData.recipe_id],
    queryFn: async () => {
      if (!formData.recipe_id) return null;
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", formData.recipe_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!formData.recipe_id,
  });

  const { data: batch, isLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  // Auto-generate batch code when recipe changes
  useEffect(() => {
    if (selectedRecipe && !isEdit && !formData.batch_code) {
      const generateBatchCode = async () => {
        const { data: existingBatches } = await supabase
          .from("batches")
          .select("id")
          .eq("recipe_id", selectedRecipe.id);
        
        const batchNumber = (existingBatches?.length || 0) + 1;
        const dateStr = format(new Date(formData.start_date), "yyyy-MM-dd");
        const code = `${dateStr}-${selectedRecipe.name.substring(0, 3).toUpperCase()}-${batchNumber}`;
        
        setFormData(prev => ({ ...prev, batch_code: code }));
      };
      
      generateBatchCode();
    }
  }, [selectedRecipe, formData.start_date, isEdit]);

  useEffect(() => {
    if (batch) {
      setFormData({
        batch_code: batch.batch_code,
        recipe_id: batch.recipe_id || "",
        start_date: batch.start_date,
        status: batch.status,
        total_volume_liters: batch.total_volume_liters?.toString() || "",
        vessel_type: batch.vessel_type || "",
        vessel_location: batch.vessel_location || "",
        initial_ph: batch.initial_ph?.toString() || "",
        initial_brix: batch.initial_brix?.toString() || "",
        ambient_temperature_c: batch.ambient_temperature_c?.toString() || "",
        target_ready_date_f1: batch.target_ready_date_f1 || "",
        starter_source: batch.starter_source || "",
        scoby_info: batch.scoby_info || "",
        general_notes: batch.general_notes || "",
      });
    }
  }, [batch]);

  useEffect(() => {
    if (selectedRecipe && !isEdit) {
      setFormData((prev) => {
        const updates: any = {};
        
        // Update target ready date if recipe has target days
        if (selectedRecipe.target_f1_days_max) {
          const startDate = new Date(prev.start_date);
          const targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + selectedRecipe.target_f1_days_max);
          updates.target_ready_date_f1 = format(targetDate, "yyyy-MM-dd");
        }
        
        // Auto-fill volume from recipe if not manually set
        if (selectedRecipe.batch_size_liters && !prev.total_volume_liters) {
          updates.total_volume_liters = selectedRecipe.batch_size_liters.toString();
        }
        
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [selectedRecipe, formData.start_date, isEdit]);

  const scaledQuantities = selectedRecipe && formData.total_volume_liters ? {
    totalTea: (selectedRecipe.tea_amount_g_per_liter || 0) * parseFloat(formData.total_volume_liters || "0"),
    totalSugar: (selectedRecipe.sugar_g_per_liter || 0) * parseFloat(formData.total_volume_liters || "0"),
    starterVolume: (selectedRecipe.starter_percentage || 0) * parseFloat(formData.total_volume_liters || "0") / 100,
  } : null;

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        batch_code: data.batch_code,
        start_date: data.start_date,
        status: data.status as "planned" | "fermenting_f1" | "ready_for_f2" | "fermenting_f2" | "cold_crash" | "bottled" | "finished" | "failed",
        vessel_type: data.vessel_type || null,
        vessel_location: data.vessel_location || null,
        starter_source: data.starter_source || null,
        scoby_info: data.scoby_info || null,
        general_notes: data.general_notes || null,
        recipe_id: data.recipe_id || null,
        total_volume_liters: parseFloat(data.total_volume_liters),
        initial_ph: data.initial_ph ? parseFloat(data.initial_ph) : null,
        initial_brix: data.initial_brix ? parseFloat(data.initial_brix) : null,
        ambient_temperature_c: data.ambient_temperature_c ? parseFloat(data.ambient_temperature_c) : null,
        target_ready_date_f1: data.target_ready_date_f1 || null,
      };

      if (isEdit) {
        const { error } = await supabase.from("batches").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("batches").insert([{ ...payload, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["active-batches"] });
      toast.success(isEdit ? "Batch updated!" : "Batch created!");
      navigate("/batches");
    },
    onError: (error) => {
      toast.error("Failed to save batch: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      const validatedData = batchSchema.parse({
        ...formData,
        total_volume_liters: parseFloat(formData.total_volume_liters),
        initial_ph: formData.initial_ph ? parseFloat(formData.initial_ph) : undefined,
        initial_brix: formData.initial_brix ? parseFloat(formData.initial_brix) : undefined,
        ambient_temperature_c: formData.ambient_temperature_c ? parseFloat(formData.ambient_temperature_c) : undefined,
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
          <Button variant="ghost" onClick={() => navigate("/batches")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Batch" : "New Batch"}
            </h2>
            <p className="text-muted-foreground">Track a kombucha fermentation batch</p>
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
                  <Label htmlFor="batch_code">Batch Code *</Label>
                  <Input
                    id="batch_code"
                    required
                    value={formData.batch_code}
                    onChange={(e) => handleChange("batch_code", e.target.value)}
                    placeholder="2025-11-20-A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe_id">Recipe</Label>
                  <Select value={formData.recipe_id || undefined} onValueChange={(v) => handleChange("recipe_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipe (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes?.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_volume_liters">
                    Volume (L) *
                    {selectedRecipe?.batch_size_liters && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Recipe: {selectedRecipe.batch_size_liters}L)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="total_volume_liters"
                    type="number"
                    step="0.1"
                    required
                    value={formData.total_volume_liters}
                    onChange={(e) => handleChange("total_volume_liters", e.target.value)}
                    placeholder="5.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="fermenting_f1">Fermenting F1</SelectItem>
                      <SelectItem value="ready_for_f2">Ready for F2</SelectItem>
                      <SelectItem value="fermenting_f2">Fermenting F2</SelectItem>
                      <SelectItem value="cold_crash">Cold Crash</SelectItem>
                      <SelectItem value="bottled">Bottled</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {scaledQuantities && selectedRecipe && (
            <Card className="bg-accent/10">
              <CardHeader>
                <CardTitle>Scaled Recipe Quantities</CardTitle>
                <CardDescription>
                  Calculated for {formData.total_volume_liters}L batch
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Total Tea</div>
                  <div className="text-lg font-semibold">
                    {Math.round(scaledQuantities.totalTea * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({selectedRecipe.tea_amount_g_per_liter}g/L)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Sugar</div>
                  <div className="text-lg font-semibold">
                    {Math.round(scaledQuantities.totalSugar * 10) / 10}g
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({selectedRecipe.sugar_g_per_liter}g/L)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Starter Volume</div>
                  <div className="text-lg font-semibold">
                    {Math.round(scaledQuantities.starterVolume * 100) / 100}L
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({selectedRecipe.starter_percentage}%)
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Vessel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vessel_type">Vessel Type</Label>
                  <Input
                    id="vessel_type"
                    value={formData.vessel_type}
                    onChange={(e) => handleChange("vessel_type", e.target.value)}
                    placeholder="3L glass jar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_location">Location</Label>
                  <Input
                    id="vessel_location"
                    value={formData.vessel_location}
                    onChange={(e) => handleChange("vessel_location", e.target.value)}
                    placeholder="Kitchen shelf left"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Initial Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="initial_ph">Initial pH</Label>
                  <Input
                    id="initial_ph"
                    type="number"
                    step="0.1"
                    value={formData.initial_ph}
                    onChange={(e) => handleChange("initial_ph", e.target.value)}
                    placeholder="3.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial_brix">Initial Brix</Label>
                  <Input
                    id="initial_brix"
                    type="number"
                    step="0.1"
                    value={formData.initial_brix}
                    onChange={(e) => handleChange("initial_brix", e.target.value)}
                    placeholder="8.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambient_temperature_c">Ambient Temp (°C)</Label>
                  <Input
                    id="ambient_temperature_c"
                    type="number"
                    step="0.1"
                    value={formData.ambient_temperature_c}
                    onChange={(e) => handleChange("ambient_temperature_c", e.target.value)}
                    placeholder="22"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_ready_date_f1">Target F1 Ready Date</Label>
                <Input
                  id="target_ready_date_f1"
                  type="date"
                  value={formData.target_ready_date_f1}
                  onChange={(e) => handleChange("target_ready_date_f1", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Starter & SCOBY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="starter_source">Starter Source</Label>
                <Input
                  id="starter_source"
                  value={formData.starter_source}
                  onChange={(e) => handleChange("starter_source", e.target.value)}
                  placeholder="Main starter jar #1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scoby_info">SCOBY Info</Label>
                <Textarea
                  id="scoby_info"
                  value={formData.scoby_info}
                  onChange={(e) => handleChange("scoby_info", e.target.value)}
                  placeholder="SCOBY details, age, condition..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="general_notes"
                value={formData.general_notes}
                onChange={(e) => handleChange("general_notes", e.target.value)}
                placeholder="Any observations or notes about this batch..."
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
              {isEdit ? "Update Batch" : "Create Batch"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/batches")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BatchForm;
