import { FlaskConical, Leaf, Beaker, ShieldAlert, Sparkles } from "lucide-react";

// A deliberately generic, beginner-friendly kombucha primer — the kind of thing
// you'd find on any brewing blog. It is NOT anyone's dialled-in house recipe;
// every brewer tunes their own numbers (and records them in Brew Buddy).

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-card/60 p-5">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h2>
    <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <li className="flex gap-3">
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {n}
    </span>
    <p className="pt-0.5">
      <span className="font-medium text-foreground">{title}</span> {children}
    </p>
  </li>
);

const GuideContent = () => {
  const needs = [
    "A wide glass jar (2–4 L)",
    "A SCOBY + ~1 cup starter liquid",
    "Plain black or green tea (no flavoured/oily)",
    "White sugar",
    "Filtered / dechlorinated water",
    "A tight-woven cloth + rubber band",
  ];

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed text-muted-foreground">
        Kombucha is sweet tea fermented by a SCOBY (a culture of bacteria and yeast).
        It happens in two stages: <strong className="text-foreground">F1</strong> turns sweet tea
        into tangy kombucha, and an optional <strong className="text-foreground">F2</strong> adds
        flavour and fizz in sealed bottles. Here's the whole thing in five minutes.
      </p>

      <Section icon={Leaf} title="What you'll need">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {needs.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={FlaskConical} title="F1 — the main ferment">
        <ol className="space-y-3">
          <Step n={1} title="Brew sweet tea.">
            A good beginner ratio is about <strong className="text-foreground">5 g of tea per litre</strong> of
            water and <strong className="text-foreground">60–70 g of sugar per litre</strong>. Steep the tea,
            then stir in the sugar until fully dissolved.
          </Step>
          <Step n={2} title="Cool it down.">
            Let the sweet tea reach room temperature — hot liquid will hurt the SCOBY.
          </Step>
          <Step n={3} title="Add SCOBY + starter.">
            Pour the cooled tea into your jar, add the starter liquid (roughly 10–20% of the volume)
            and the SCOBY.
          </Step>
          <Step n={4} title="Cover and wait.">
            Cover with the cloth, keep it warmish (around 20–26 °C) out of direct sun, and leave it
            for 7–14 days.
          </Step>
          <Step n={5} title="Taste from day 7.">
            Sip with a clean straw. Too sweet? Give it longer. Pleasantly tart? It's ready.
          </Step>
        </ol>
      </Section>

      <Section icon={Beaker} title="F2 — flavour & fizz (optional)">
        <ol className="space-y-3">
          <Step n={1} title="Reserve starter.">
            Set aside ~1 cup of kombucha (and the SCOBY) for your next batch.
          </Step>
          <Step n={2} title="Bottle with flavour.">
            Bottle the rest in sealable bottles, adding a little fruit, juice, or herbs.
          </Step>
          <Step n={3} title="Build carbonation.">
            Seal and leave at room temperature for 2–4 days.
          </Step>
          <Step n={4} title="Chill.">
            Refrigerate to stop the fizz building. Open over a sink the first few times.
          </Step>
        </ol>
      </Section>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Staying safe
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Keep everything clean — wash hands and equipment before handling the culture.</li>
          <li>
            A healthy brew smells tart and vinegary. <strong className="text-foreground">Fuzzy, dry,
            coloured spots</strong> on top are mould — if in doubt, throw it out and start over.
          </li>
          <li>Brown stringy bits and a new layer forming on top are normal and harmless.</li>
          <li>Never ferment in metal or chipped ceramic — glass is safest.</li>
        </ul>
      </div>

      <Section icon={Sparkles} title="Now make it yours">
        <p>
          These are just starting points. The fun of brewing is dialling in your own tea blend,
          sugar level, timing and flavours — and that's exactly what Brew Buddy is for. Log each
          batch, jot your pH and tasting notes, and let the patterns show you your perfect brew.
        </p>
      </Section>
    </div>
  );
};

export default GuideContent;
