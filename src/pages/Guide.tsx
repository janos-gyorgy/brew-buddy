import { Link } from "react-router-dom";
import { FlaskConical, LogIn } from "lucide-react";
import GuideContent from "@/components/GuideContent";
import ThemeToggle from "@/components/ThemeToggle";

const Guide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <FlaskConical className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">Brew Buddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Kombucha quickstart</h1>
        <p className="mb-6 text-sm text-muted-foreground">Everything you need to brew your first batch.</p>
        <GuideContent />
        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-border bg-card/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Ready to track your own brews?</p>
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            Log in to Brew Buddy
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Guide;
