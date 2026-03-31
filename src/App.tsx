import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import BotanicalInfusions from "./pages/BotanicalInfusions";
import RecipeForm from "./pages/RecipeForm";
import RecipeDetail from "./pages/RecipeDetail";
import Batches from "./pages/Batches";
import BatchForm from "./pages/BatchForm";
import BatchDetail from "./pages/BatchDetail";
import F2Variants from "./pages/F2Variants";
import F2VariantDetail from "./pages/F2VariantDetail";
import NotFound from "./pages/NotFound";
import Statistics from "./pages/Statistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/botanicals" element={<BotanicalInfusions />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/batches/new" element={<BatchForm />} />
          <Route path="/batches/:id" element={<BatchDetail />} />
          <Route path="/batches/:id/edit" element={<BatchForm />} />
          <Route path="/f2-variants" element={<F2Variants />} />
          <Route path="/f2-variants/:id" element={<F2VariantDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
