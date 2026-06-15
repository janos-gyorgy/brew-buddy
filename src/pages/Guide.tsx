import { Link } from "react-router-dom";
import { FlaskConical, ArrowLeft } from "lucide-react";
import GuideContent from "@/components/GuideContent";

const Guide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Brew Buddy</span>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Kombucha quickstart</h1>
        <p className="mb-6 text-sm text-muted-foreground">Everything you need to brew your first batch.</p>
        <GuideContent />
        <p className="mt-8">
          <Link to="/" className="font-medium text-primary hover:underline">
            ← Back to the app
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Guide;
