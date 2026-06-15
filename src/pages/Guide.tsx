import { Link } from "react-router-dom";
import { FlaskConical, ArrowLeft } from "lucide-react";

// A deliberately generic, beginner-friendly kombucha primer — the kind of thing
// you'd find on any brewing blog. It is NOT anyone's dialled-in house recipe;
// every brewer tunes their own numbers (and records them in Brew Buddy).
const Guide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Kombucha quickstart</h1>
          <p className="lead">
            Kombucha is sweet tea fermented by a SCOBY (a culture of bacteria and yeast).
            It happens in two stages: <strong>F1</strong> turns sweet tea into tangy kombucha,
            and an optional <strong>F2</strong> adds flavour and fizz in sealed bottles.
            Here's the whole thing in five minutes.
          </p>

          <h2>What you'll need</h2>
          <ul>
            <li>A wide glass jar (2–4 litres works well)</li>
            <li>A SCOBY plus about 1 cup of starter liquid (mature kombucha)</li>
            <li>Tea — plain black or green (no flavoured/oily teas)</li>
            <li>White sugar (the yeast eats it, not you)</li>
            <li>Filtered or dechlorinated water</li>
            <li>A tightly-woven cloth and a rubber band to cover the jar</li>
          </ul>

          <h2>F1 — the main ferment</h2>
          <ol>
            <li>
              <strong>Brew sweet tea.</strong> A common beginner ratio is about
              8 tea bags and 1 cup (~200 g) of sugar per 3–4 litres of water.
              Steep the tea, stir in the sugar until dissolved.
            </li>
            <li>
              <strong>Cool it down.</strong> Let the sweet tea reach room temperature —
              hot liquid will hurt the SCOBY.
            </li>
            <li>
              <strong>Add SCOBY + starter.</strong> Pour the cooled tea into your jar,
              add the starter liquid (roughly 10–20% of the volume) and the SCOBY.
            </li>
            <li>
              <strong>Cover and wait.</strong> Cover with the cloth, keep it somewhere
              warmish (around 20–26 °C) out of direct sun, and leave it for 7–14 days.
            </li>
            <li>
              <strong>Taste from day 7.</strong> Start tasting with a clean straw.
              Too sweet? Give it longer. Pleasantly tart? It's ready.
            </li>
          </ol>

          <h2>F2 — flavour &amp; fizz (optional)</h2>
          <ol>
            <li>Set aside ~1 cup of your kombucha (and the SCOBY) as starter for the next batch.</li>
            <li>Bottle the rest in sealable bottles, adding a little fruit, juice, or herbs.</li>
            <li>Seal and leave at room temperature for 2–4 days to build carbonation.</li>
            <li>Refrigerate to stop the fizz building further. Open over a sink the first few times.</li>
          </ol>

          <h2>Staying safe</h2>
          <ul>
            <li>Keep everything clean; wash hands and equipment before handling the culture.</li>
            <li>A healthy brew smells tart and vinegary. <strong>Fuzzy, dry, coloured spots</strong> on top are mould — if in doubt, throw it out and start over.</li>
            <li>Brown stringy bits and a new layer forming on top are normal and harmless.</li>
            <li>Never ferment in metal or chipped/decorative ceramic — glass is safest.</li>
          </ul>

          <h2>Now make it yours</h2>
          <p>
            These are just starting points. The fun of brewing is dialling in your own
            tea blend, sugar level, timing and flavours — and that's exactly what Brew Buddy
            is for. Log each batch, jot your pH and tasting notes, and let the patterns show
            you your perfect brew.
          </p>

          <p>
            <Link to="/" className="no-underline font-medium text-primary">→ Back to the app</Link>
          </p>
        </article>
      </main>
    </div>
  );
};

export default Guide;
