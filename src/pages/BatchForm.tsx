import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const BatchForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get("recipe");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      const startDate = new Date(formData.start_date);
      if (selectedRecipe.target_f1_days_max) {
        const targetDate = new Date(startDate);
        targetDate.setDate(targetDate.getDate() + selectedRecipe.target_f1_days_max);
        setFormData((prev) => ({
          ...prev,
          target_ready_date_f1: format(targetDate, "yyyy-MM-dd"),
        }));
      }
      if (selectedRecipe.batch_size_liters && !formData.total_volume_liters) {
        setFormData((prev) => ({
          ...prev,
          total_volume_liters: selectedRecipe.batch_size_liters?.toString() || "",
        }));
      }
    }
  }, [selectedRecipe, formData.start_date, isEdit]);

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
        const { error } = await supabase.from("batches").insert([payload]);
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
    saveMutation.mutate(formData);
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
                  <Select value={formData.recipe_id} onValueChange={(v) => handleChange("recipe_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipe (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No recipe</SelectItem>
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
                  <Label htmlFor="total_volume_liters">Volume (L) *</Label>
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
