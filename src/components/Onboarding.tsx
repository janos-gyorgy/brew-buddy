import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, ScrollText, LineChart, Beaker, BookOpen, ArrowRight } from "lucide-react";

interface Slide {
  icon: typeof Sparkles;
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    icon: Sparkles,
    title: "Welcome to Brew Buddy",
    body: "Your personal kombucha logbook. New to brewing? Start with the 5-minute quickstart below — then come back and track every batch you make.",
  },
  {
    icon: ScrollText,
    title: "Recipes & batches",
    body: "Save your recipes once, then spin up batches from them. Each batch moves through its lifecycle — planned, F1, F2, cold crash, bottled — so you always know what's brewing.",
  },
  {
    icon: LineChart,
    title: "Fermentation log",
    body: "Record pH, Brix, temperature and tasting notes over time. Trends help you catch problems early and repeat your best brews.",
  },
  {
    icon: Beaker,
    title: "F2 variants & stats",
    body: "Split a batch into flavoured second-ferment bottles, rate them, and watch your stats add up. Export everything any time. That's it — happy brewing!",
  },
];

const Onboarding = () => {
  const { markOnboarded } = useAuth();
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  const isLast = index === slides.length - 1;
  const slide = slides[index];
  const Icon = slide.icon;

  const finish = async () => {
    setClosing(true);
    try {
      await markOnboarded();
    } catch {
      // Even if the call fails, don't trap the user behind the splash.
      setClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-4">
            <Icon className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground">{slide.title}</h2>
        <p className="mt-3 text-center text-muted-foreground">{slide.body}</p>

        {index === 0 && (
          <Link
            to="/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-primary font-medium hover:bg-primary/10 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Read the kombucha quickstart
          </Link>
        )}

        <div className="mt-8 flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-muted"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={finish} disabled={closing}>
            Skip
          </Button>
          {isLast ? (
            <Button onClick={finish} disabled={closing}>
              Start brewing
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
