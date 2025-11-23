import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import RecipeForm from "./pages/RecipeForm";
import RecipeDetail from "./pages/RecipeDetail";
import Batches from "./pages/Batches";
import BatchForm from "./pages/BatchForm";
import BatchDetail from "./pages/BatchDetail";
import F2Variants from "./pages/F2Variants";
import F2VariantDetail from "./pages/F2VariantDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Statistics from "./pages/Statistics";
import Starter from "./pages/Starter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/recipes/new" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
            <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />
            <Route path="/batches/new" element={<ProtectedRoute><BatchForm /></ProtectedRoute>} />
            <Route path="/batches/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
            <Route path="/batches/:id/edit" element={<ProtectedRoute><BatchForm /></ProtectedRoute>} />
            <Route path="/f2-variants" element={<ProtectedRoute><F2Variants /></ProtectedRoute>} />
            <Route path="/f2-variants/:id" element={<ProtectedRoute><F2VariantDetail /></ProtectedRoute>} />
            <Route path="/starter" element={<ProtectedRoute><Starter /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
