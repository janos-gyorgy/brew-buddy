import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { F2Variant, F2Status } from "@/lib/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trash2, ExternalLink, MessageSquare } from "lucide-react";
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
import { tastingNotesSchema } from "@/lib/validationSchemas";
import { z } from "zod";

const F2VariantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [notesFormData, setNotesFormData] = useState({ tasting_rating: "", tasting_notes: "" });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: variant, isLoading } = useQuery({
    queryKey: ["f2-variant", id],
    queryFn: () => api.get<F2Variant>(`/f2-variants/${id}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (f2_status: F2Status) =>
      api.patch<F2Variant>(`/f2-variants/${id}/status`, { f2_status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f2-variant", id] });
      queryClient.invalidateQueries({ queryKey: ["f2-variants"] });
      toast.success("Status updated!");
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: (data: { tasting_rating: number | null; tasting_notes: string | null }) =>
      api.patch<F2Variant>(`/f2-variants/${id}/notes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f2-variant", id] });
      queryClient.invalidateQueries({ queryKey: ["f2-variants"] });
      setIsNotesDialogOpen(false);
      toast.success("Tasting notes updated!");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/f2-variants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f2-variants"] });
      toast.success("F2 variant deleted");
      navigate("/f2-variants");
    },
    onError: (error) => toast.error("Failed to delete: " + error.message),
  });

  const handleOpenNotesDialog = () => {
    if (variant) {
      setNotesFormData({
        tasting_rating: variant.tasting_rating?.toString() || "",
        tasting_notes: variant.tasting_notes || "",
      });
    }
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = () => {
    try {
      tastingNotesSchema.parse({
        tasting_rating: notesFormData.tasting_rating ? parseInt(notesFormData.tasting_rating) : undefined,
        tasting_notes: notesFormData.tasting_notes || undefined,
      });
      setValidationErrors({});
      updateNotesMutation.mutate({
        tasting_rating: notesFormData.tasting_rating ? parseInt(notesFormData.tasting_rating) : null,
        tasting_notes: notesFormData.tasting_notes || null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) errors[err.path[0].toString()] = err.message;
        });
        setValidationErrors(errors);
        toast.error('Please fix the validation errors');
      }
    }
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

  if (!variant) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">F2 variant not found</p>
          <Button className="mt-4" onClick={() => navigate("/f2-variants")}>Back to F2 Variants</Button>
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
            <Button variant="outline" onClick={handleOpenNotesDialog}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {variant.tasting_notes || variant.tasting_rating ? "Edit Notes" : "Add Notes"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
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
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Batch Information</CardTitle></CardHeader>
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
                <div className="font-medium">{variant.batches?.recipes?.name || "No recipe"}</div>
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
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
          <CardHeader><CardTitle>Volume & Bottles</CardTitle></CardHeader>
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

        {(variant.fruits_and_juices || variant.herbs_and_spices || variant.other_additives) && (
          <Card>
            <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Tasting Notes</CardTitle></CardHeader>
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

      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tasting Notes</DialogTitle>
            <DialogDescription>Add your tasting notes and rating for this F2 variant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tasting_rating">Rating (1-10)</Label>
              <Input
                id="tasting_rating"
                type="number"
                min="1"
                max="10"
                value={notesFormData.tasting_rating}
                onChange={(e) => setNotesFormData({ ...notesFormData, tasting_rating: e.target.value })}
                placeholder="8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasting_notes">Notes</Label>
              <Textarea
                id="tasting_notes"
                value={notesFormData.tasting_notes}
                onChange={(e) => setNotesFormData({ ...notesFormData, tasting_notes: e.target.value })}
                placeholder="Describe the flavor, carbonation, appearance..."
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
                {updateNotesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default F2VariantDetail;
