import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BotanicalInfusion } from "@/lib/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DefaultInput from "@/components/DefaultInput";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, Plus, Leaf, Trash2, Edit, Droplets, Thermometer, Clock } from "lucide-react";

const emptyForm = {
  name: "",
  ingredient: "",
  amount_g: "",
  water_ml: "",
  temp_c: "",
  steep_minutes: "",
  notes: "",
};

const BotanicalInfusions = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: infusions, isLoading } = useQuery({
    queryKey: ["botanical_infusions"],
    queryFn: () => api.get<BotanicalInfusion[]>('/botanical-infusions'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        name: data.name,
        ingredient: data.ingredient,
        amount_g: data.amount_g ? parseFloat(data.amount_g) : null,
        water_ml: data.water_ml ? parseFloat(data.water_ml) : null,
        temp_c: data.temp_c ? parseFloat(data.temp_c) : null,
        steep_minutes: data.steep_minutes ? parseInt(data.steep_minutes) : null,
        notes: data.notes || null,
      };
      if (editingId) {
        return api.put<BotanicalInfusion>(`/botanical-infusions/${editingId}`, payload);
      } else {
        return api.post<BotanicalInfusion>('/botanical-infusions', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botanical_infusions"] });
      toast.success(editingId ? "Infusion updated!" : "Infusion created!");
      resetForm();
    },
    onError: (error) => toast.error("Failed to save: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/botanical-infusions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["botanical_infusions"] });
      toast.success("Infusion deleted");
    },
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const openEdit = (infusion: BotanicalInfusion) => {
    setEditingId(infusion.id);
    setFormData({
      name: infusion.name || "",
      ingredient: infusion.ingredient || "",
      amount_g: infusion.amount_g?.toString() || "",
      water_ml: infusion.water_ml?.toString() || "",
      temp_c: infusion.temp_c?.toString() || "",
      steep_minutes: infusion.steep_minutes?.toString() || "",
      notes: infusion.notes || "",
    });
    setDialogOpen(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ingredient) {
      toast.error("Name and ingredient are required");
      return;
    }
    saveMutation.mutate(formData);
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
            <h2 className="text-3xl font-bold text-foreground">Botanical Infusions</h2>
            <p className="text-muted-foreground">Herbal and botanical infusion recipes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Infusion</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Infusion" : "New Botanical Infusion"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Camomile Calm" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredient">Ingredient *</Label>
                  <Input id="ingredient" value={formData.ingredient} onChange={(e) => handleChange("ingredient", e.target.value)} placeholder="Dried camomile flowers" required />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount_g">Amount (g)</Label>
                    <DefaultInput id="amount_g" type="number" step="0.1" value={formData.amount_g} onChange={(e) => handleChange("amount_g", e.target.value)} onValueChange={(v) => handleChange("amount_g", v)} defaultFillValue="3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water_ml">Water (ml)</Label>
                    <DefaultInput id="water_ml" type="number" step="1" value={formData.water_ml} onChange={(e) => handleChange("water_ml", e.target.value)} onValueChange={(v) => handleChange("water_ml", v)} defaultFillValue="300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temp_c">Temperature (°C)</Label>
                    <DefaultInput id="temp_c" type="number" step="1" value={formData.temp_c} onChange={(e) => handleChange("temp_c", e.target.value)} onValueChange={(v) => handleChange("temp_c", v)} defaultFillValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steep_minutes">Steep Time (min)</Label>
                    <DefaultInput id="steep_minutes" type="number" value={formData.steep_minutes} onChange={(e) => handleChange("steep_minutes", e.target.value)} onValueChange={(v) => handleChange("steep_minutes", v)} defaultFillValue="10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Additional notes..." rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Update Infusion" : "Create Infusion"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {infusions && infusions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {infusions.map((infusion) => (
              <Card key={infusion.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">{infusion.name}</CardTitle>
                      <CardDescription className="mt-1">{infusion.ingredient}</CardDescription>
                    </div>
                    <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                    {infusion.amount_g && <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">{infusion.amount_g}g</span>}
                    {infusion.water_ml && <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded"><Droplets className="h-3 w-3" />{infusion.water_ml}ml</span>}
                    {infusion.temp_c && <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded"><Thermometer className="h-3 w-3" />{infusion.temp_c}°C</span>}
                    {infusion.steep_minutes && <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded"><Clock className="h-3 w-3" />{infusion.steep_minutes} min</span>}
                  </div>
                  {infusion.notes && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{infusion.notes}</p>}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(infusion)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete infusion?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete this botanical infusion.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(infusion.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No botanical infusions yet</p>
              <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create First Infusion</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default BotanicalInfusions;
