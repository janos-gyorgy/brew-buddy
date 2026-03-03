import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit, Plus, TestTube, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [f2DialogOpen, setF2DialogOpen] = useState(false);

  const [logFormData, setLogFormData] = useState({
    phase: "f1",
    ph: "",
    brix: "",
    temperature_c: "",
    taste_notes: "",
    actions: "",
    smell_color_notes: "",
    issues_or_flags: "",
  });

  const [f2FormData, setF2FormData] = useState({
    name: "",
    bottle_count: "",
    bottle_size_liters: "0.5",
    fruits_and_juices: "",
    herbs_and_spices: "",
    other_additives: "",
    f2_start_date: format(new Date(), "yyyy-MM-dd"),
    expected_ready_date_f2: "",
  });

  const { data: batch, isLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*, recipes(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["fermentation-logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fermentation_log_entries")
        .select("*")
        .eq("batch_id", id)
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: f2Variants } = useQuery({
    queryKey: ["batch-f2-variants", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("f2_variant_batches")
        .select("*")
        .eq("parent_batch_id", id)
        .order("f2_start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addLogMutation = useMutation({
    mutationFn: async (data: typeof logFormData) => {
      const { error } = await supabase.from("fermentation_log_entries").insert([
        {
          batch_id: id,
          user_id: user?.id,
          phase: data.phase as "f1" | "f2" | "cold_crash" | "storage",
          ph: data.ph ? parseFloat(data.ph) : null,
          brix: data.brix ? parseFloat(data.brix) : null,
          temperature_c: data.temperature_c ? parseFloat(data.temperature_c) : null,
          taste_notes: data.taste_notes || null,
          actions: data.actions || null,
          smell_color_notes: data.smell_color_notes || null,
          issues_or_flags: data.issues_or_flags || null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fermentation-logs", id] });
      toast.success("Log entry added!");
      setLogDialogOpen(false);
      setLogFormData({
        phase: "f1",
        ph: "",
        brix: "",
        temperature_c: "",
        taste_notes: "",
        actions: "",
        smell_color_notes: "",
        issues_or_flags: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to add log: " + error.message);
    },
  });

  const createF2Mutation = useMutation({
    mutationFn: async (data: typeof f2FormData) => {
      const { error } = await supabase.from("f2_variant_batches").insert([
        {
          parent_batch_id: id,
          user_id: user?.id,
          name: data.name,
          bottle_count: parseInt(data.bottle_count),
          bottle_size_liters: parseFloat(data.bottle_size_liters),
          fruits_and_juices: data.fruits_and_juices || null,
          herbs_and_spices: data.herbs_and_spices || null,
          other_additives: data.other_additives || null,
          priming_sugar_g_per_bottle: data.priming_sugar_g_per_bottle ? parseFloat(data.priming_sugar_g_per_bottle) : null,
          f2_start_date: data.f2_start_date,
          expected_ready_date_f2: data.expected_ready_date_f2 || null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-f2-variants", id] });
      queryClient.invalidateQueries({ queryKey: ["active-f2-variants"] });
      toast.success("F2 variant created!");
      setF2DialogOpen(false);
      setF2FormData({
        name: "",
        bottle_count: "",
        bottle_size_liters: "0.5",
        fruits_and_juices: "",
        herbs_and_spices: "",
        other_additives: "",
        priming_sugar_g_per_bottle: "",
        f2_start_date: format(new Date(), "yyyy-MM-dd"),
        expected_ready_date_f2: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to create F2 variant: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: Database["public"]["Enums"]["batch_status"]) => {
      const { error } = await supabase
        .from("batches")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch", id] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["active-batches"] });
      toast.success("Status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("batches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Batch deleted");
      navigate("/batches");
    },
    onError: (error) => {
      toast.error("Failed to delete batch: " + error.message);
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-muted text-muted-foreground",
      fermenting_f1: "bg-info text-info-foreground",
      ready_for_f2: "bg-warning text-warning-foreground",
      fermenting_f2: "bg-info text-info-foreground",
      cold_crash: "bg-accent text-accent-foreground",
      bottled: "bg-secondary text-secondary-foreground",
      finished: "bg-success text-success-foreground",
      failed: "bg-destructive text-destructive-foreground",
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

  if (!batch) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Batch not found</p>
          <Button className="mt-4" onClick={() => navigate("/batches")}>
            Back to Batches
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
            <Button variant="ghost" onClick={() => navigate("/batches")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{batch.batch_code}</h2>
              <p className="text-muted-foreground">
                {batch.recipes?.name || "No recipe"} • {batch.total_volume_liters}L
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/batches/${id}/edit`)}>
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
                  <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this batch and all associated log entries.
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
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(batch.status)} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
                {batch.status.replace(/_/g, " ")}
              </Badge>
              <Select
                value={batch.status}
                onValueChange={(value) => updateStatusMutation.mutate(value as Database["public"]["Enums"]["batch_status"])}
              >
                <SelectTrigger className="w-[250px]">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-foreground">{format(new Date(batch.start_date), "MMM d, yyyy")}</p>
              </div>
              {batch.target_ready_date_f1 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target F1 Ready</p>
                  <p className="text-foreground">{format(new Date(batch.target_ready_date_f1), "MMM d, yyyy")}</p>
                </div>
              )}
              {batch.vessel_type && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vessel</p>
                  <p className="text-foreground">{batch.vessel_type}</p>
                </div>
              )}
              {batch.vessel_location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-foreground">{batch.vessel_location}</p>
                </div>
              )}
              {batch.initial_ph && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Initial pH</p>
                  <p className="text-foreground">{batch.initial_ph}</p>
                </div>
              )}
              {batch.initial_brix && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Initial Brix</p>
                  <p className="text-foreground">{batch.initial_brix}</p>
                </div>
              )}
              {batch.ambient_temperature_c && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ambient Temp</p>
                  <p className="text-foreground">{batch.ambient_temperature_c}°C</p>
                </div>
              )}
              {batch.starter_source && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Starter Source</p>
                  <p className="text-foreground">{batch.starter_source}</p>
                </div>
              )}
            </div>
            {batch.scoby_info && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">SCOBY Info</p>
                <p className="text-foreground">{batch.scoby_info}</p>
              </div>
            )}
            {batch.general_notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{batch.general_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fermentation Log</CardTitle>
                <CardDescription>Track pH, Brix, and observations</CardDescription>
              </div>
              <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Fermentation Log Entry</DialogTitle>
                    <DialogDescription>Record measurements and observations</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Phase</Label>
                        <Select
                          value={logFormData.phase}
                          onValueChange={(v) => setLogFormData({ ...logFormData, phase: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="f1">F1</SelectItem>
                            <SelectItem value="f2">F2</SelectItem>
                            <SelectItem value="cold_crash">Cold Crash</SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>pH</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={logFormData.ph}
                          onChange={(e) => setLogFormData({ ...logFormData, ph: e.target.value })}
                          placeholder="3.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brix</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={logFormData.brix}
                          onChange={(e) => setLogFormData({ ...logFormData, brix: e.target.value })}
                          placeholder="6.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Temp (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={logFormData.temperature_c}
                          onChange={(e) => setLogFormData({ ...logFormData, temperature_c: e.target.value })}
                          placeholder="22"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Taste Notes</Label>
                      <Textarea
                        value={logFormData.taste_notes}
                        onChange={(e) => setLogFormData({ ...logFormData, taste_notes: e.target.value })}
                        placeholder="Sweet, tangy, balanced..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actions Taken</Label>
                      <Textarea
                        value={logFormData.actions}
                        onChange={(e) => setLogFormData({ ...logFormData, actions: e.target.value })}
                        placeholder="Stirred, vented, adjusted temperature..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Smell & Color</Label>
                      <Textarea
                        value={logFormData.smell_color_notes}
                        onChange={(e) => setLogFormData({ ...logFormData, smell_color_notes: e.target.value })}
                        placeholder="Fruity aroma, dark amber color..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issues or Flags</Label>
                      <Textarea
                        value={logFormData.issues_or_flags}
                        onChange={(e) => setLogFormData({ ...logFormData, issues_or_flags: e.target.value })}
                        placeholder="Any concerns or observations..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => addLogMutation.mutate(logFormData)}
                      disabled={addLogMutation.isPending}
                    >
                      {addLogMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Entry
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {log.phase.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm">
                        {log.ph && <span className="text-muted-foreground">pH: {log.ph}</span>}
                        {log.brix && <span className="text-muted-foreground">Brix: {log.brix}</span>}
                        {log.temperature_c && <span className="text-muted-foreground">Temp: {log.temperature_c}°C</span>}
                      </div>
                    </div>
                    {log.taste_notes && (
                      <p className="text-sm text-foreground mb-1">
                        <strong>Taste:</strong> {log.taste_notes}
                      </p>
                    )}
                    {log.actions && (
                      <p className="text-sm text-foreground mb-1">
                        <strong>Actions:</strong> {log.actions}
                      </p>
                    )}
                    {log.smell_color_notes && (
                      <p className="text-sm text-foreground mb-1">
                        <strong>Smell & Color:</strong> {log.smell_color_notes}
                      </p>
                    )}
                    {log.issues_or_flags && (
                      <p className="text-sm text-destructive">
                        <strong>Issues:</strong> {log.issues_or_flags}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No log entries yet. Add your first measurement!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>F2 Variants</CardTitle>
                <CardDescription>Flavored variants from this batch</CardDescription>
              </div>
              <Dialog open={f2DialogOpen} onOpenChange={setF2DialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <TestTube className="h-4 w-4 mr-2" />
                    Create F2 Variant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create F2 Variant</DialogTitle>
                    <DialogDescription>Add flavored secondary fermentation</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Variant Name *</Label>
                      <Input
                        value={f2FormData.name}
                        onChange={(e) => setF2FormData({ ...f2FormData, name: e.target.value })}
                        placeholder="Raspberry Ginger"
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Bottle Count *</Label>
                        <Input
                          type="number"
                          value={f2FormData.bottle_count}
                          onChange={(e) => setF2FormData({ ...f2FormData, bottle_count: e.target.value })}
                          placeholder="12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bottle Size (L) *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={f2FormData.bottle_size_liters}
                          onChange={(e) => setF2FormData({ ...f2FormData, bottle_size_liters: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sugar/Bottle (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={f2FormData.priming_sugar_g_per_bottle}
                          onChange={(e) => setF2FormData({ ...f2FormData, priming_sugar_g_per_bottle: e.target.value })}
                          placeholder="2.0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Fruits & Juices</Label>
                      <Textarea
                        value={f2FormData.fruits_and_juices}
                        onChange={(e) => setF2FormData({ ...f2FormData, fruits_and_juices: e.target.value })}
                        placeholder="Fresh raspberry, blueberry..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Herbs & Spices</Label>
                      <Textarea
                        value={f2FormData.herbs_and_spices}
                        onChange={(e) => setF2FormData({ ...f2FormData, herbs_and_spices: e.target.value })}
                        placeholder="Fresh ginger, mint..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Additives</Label>
                      <Textarea
                        value={f2FormData.other_additives}
                        onChange={(e) => setF2FormData({ ...f2FormData, other_additives: e.target.value })}
                        placeholder="Spirulina, turmeric..."
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>F2 Start Date *</Label>
                        <Input
                          type="date"
                          value={f2FormData.f2_start_date}
                          onChange={(e) => setF2FormData({ ...f2FormData, f2_start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Ready Date</Label>
                        <Input
                          type="date"
                          value={f2FormData.expected_ready_date_f2}
                          onChange={(e) => setF2FormData({ ...f2FormData, expected_ready_date_f2: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => createF2Mutation.mutate(f2FormData)}
                      disabled={createF2Mutation.isPending || !f2FormData.name || !f2FormData.bottle_count}
                    >
                      {createF2Mutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Create Variant
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {f2Variants && f2Variants.length > 0 ? (
              <div className="space-y-2">
                {f2Variants.map((variant) => (
                  <Link
                    key={variant.id}
                    to={`/f2-variants/${variant.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-secondary transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{variant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {variant.bottle_count} × {variant.bottle_size_liters}L • {variant.f2_status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No F2 variants yet. Create your first flavor variant!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BatchDetail;
