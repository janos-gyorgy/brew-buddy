import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Database, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DemoData = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePopulateDemoData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No session found");
      }

      const { data, error } = await supabase.functions.invoke('populate-demo-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Demo data error:', error);
        throw error;
      }

      console.log('Demo data response:', data);
      toast.success("Demo data loaded successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Failed to populate demo data:", error);
      toast.error(error.message || "Failed to load demo data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Load Demo Data</h2>
          <p className="text-muted-foreground">Populate your account with sample brewing data</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will add sample recipes, batches, F2 variants, fermentation logs, and starters to your account. 
            If you already have data, this will skip to avoid duplicates.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data Package
            </CardTitle>
            <CardDescription>
              Includes 3 recipes, 4 batches, 5 F2 variants, fermentation logs, and 2 starter entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Classic Green Tea Kombucha recipe</li>
              <li>• Bold Black Tea Booch recipe</li>
              <li>• Tropical Paradise Blend recipe</li>
              <li>• Multiple batches in different stages</li>
              <li>• Flavor experiments with ratings</li>
              <li>• Detailed fermentation logs</li>
              <li>• SCOBY hotel entries</li>
            </ul>
            <Button 
              onClick={handlePopulateDemoData} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Load Demo Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DemoData;
