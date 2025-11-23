import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Droplets } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Starter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    creation_date: format(new Date(), "yyyy-MM-dd"),
    status: "active",
    ph_at_creation: "",
    current_ph: "",
    sugar_g_per_liter: "",
    tea_blend_description: "",
    notes: "",
  });

  const { data: starters, isLoading } = useQuery({
    queryKey: ["starters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("starter_log")
        .select("*")
        .order("creation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-success text-success-foreground",
      low_volume: "bg-warning text-warning-foreground",
      retired: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("starter_log").insert([{
        user_id: user?.id,
        name: data.name,
        creation_date: data.creation_date,
        status: data.status as "active" | "low_volume" | "retired",
        ph_at_creation: data.ph_at_creation ? parseFloat(data.ph_at_creation) : null,
        current_ph: data.current_ph ? parseFloat(data.current_ph) : null,
        sugar_g_per_liter: data.sugar_g_per_liter ? parseFloat(data.sugar_g_per_liter) : null,
        tea_blend_description: data.tea_blend_description || null,
        notes: data.notes || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["starters"] });
      toast.success("Starter created!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        creation_date: format(new Date(), "yyyy-MM-dd"),
        status: "active",
        ph_at_creation: "",
        current_ph: "",
        sugar_g_per_liter: "",
        tea_blend_description: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to create starter: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    createMutation.mutate(formData);
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
            <h2 className="text-3xl font-bold text-foreground">Starter Log</h2>
            <p className="text-muted-foreground">Track your kombucha starters and SCOBY hotel</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Starter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Starter Entry</DialogTitle>
                <DialogDescription>
                  Log a new starter or SCOBY for your records
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Hotel SCOBY - Primary"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="creation_date">Creation Date *</Label>
                    <Input
                      id="creation_date"
                      type="date"
                      required
                      value={formData.creation_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, creation_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="low_volume">Low Volume</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ph_at_creation">pH at Creation</Label>
                    <Input
                      id="ph_at_creation"
                      type="number"
                      step="0.1"
                      value={formData.ph_at_creation}
                      onChange={(e) => setFormData(prev => ({ ...prev, ph_at_creation: e.target.value }))}
                      placeholder="3.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_ph">Current pH</Label>
                    <Input
                      id="current_ph"
                      type="number"
                      step="0.1"
                      value={formData.current_ph}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_ph: e.target.value }))}
                      placeholder="2.9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sugar_g_per_liter">Sugar (g/L)</Label>
                    <Input
                      id="sugar_g_per_liter"
                      type="number"
                      step="1"
                      value={formData.sugar_g_per_liter}
                      onChange={(e) => setFormData(prev => ({ ...prev, sugar_g_per_liter: e.target.value }))}
                      placeholder="70"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tea_blend_description">Tea Blend</Label>
                  <Input
                    id="tea_blend_description"
                    value={formData.tea_blend_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, tea_blend_description: e.target.value }))}
                    placeholder="Green and black tea blend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Source, health, and any observations"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Starter
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {starters && starters.length > 0 ? (
          <div className="space-y-3">
            {starters.map((starter) => (
              <Card key={starter.id} className="hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Droplets className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">
                          {starter.name}
                        </h3>
                        <Badge className={getStatusColor(starter.status)}>
                          {starter.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Created: {format(new Date(starter.creation_date), "MMM d, yyyy")}</span>
                        {starter.current_ph && (
                          <>
                            <span>•</span>
                            <span>pH: {starter.current_ph}</span>
                          </>
                        )}
                        {starter.sugar_g_per_liter && (
                          <>
                            <span>•</span>
                            <span>{starter.sugar_g_per_liter}g/L sugar</span>
                          </>
                        )}
                      </div>
                      {starter.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {starter.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No starters logged yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Track your SCOBY hotel and starter cultures here. This is separate from your brewing batches.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Starter
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Starter;
