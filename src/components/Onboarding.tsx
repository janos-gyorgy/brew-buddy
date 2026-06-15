import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import GuideContent from "./GuideContent";
import { Sparkles, ScrollText, LineChart, Beaker, ArrowRight } from "lucide-react";

interface Slide {
  icon: typeof Sparkles;
  title: string;
  body: string;
}

// The capability slides shown after the kombucha quickstart.
const slides: Slide[] = [
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
  // Step 0 = full quickstart guide; steps 1..n = capability slides.
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  const totalSteps = slides.length + 1;
  const isGuide = index === 0;
  const isLast = index === totalSteps - 1;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 py-6 backdrop-blur-sm">
      <div
        className={`flex max-h-[90vh] w-full flex-col rounded-2xl border border-border bg-card shadow-xl transition-all ${
          isGuide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        {isGuide ? (
          <>
            <div className="border-b border-border px-6 pb-4 pt-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to Brew Buddy</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                New to brewing? Here's the 5-minute quickstart. Then we'll show you around.
              </p>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <GuideContent />
            </div>
          </>
        ) : (
          <div className="px-8 pb-2 pt-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                {(() => {
                  const Icon = slides[index - 1].icon;
                  return <Icon className="h-10 w-10 text-primary" />;
                })()}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{slides[index - 1].title}</h2>
            <p className="mt-3 text-muted-foreground">{slides[index - 1].body}</p>
          </div>
        )}

        <div className="mt-auto border-t border-border px-6 py-4">
          <div className="mb-4 flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={finish} disabled={closing}>
              Skip
            </Button>
            {isLast ? (
              <Button onClick={finish} disabled={closing}>
                Start brewing
              </Button>
            ) : (
              <Button onClick={() => setIndex((i) => i + 1)}>
                {isGuide ? "Got it, next" : "Next"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
