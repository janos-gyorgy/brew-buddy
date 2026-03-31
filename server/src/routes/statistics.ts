import { Hono } from 'hono';
import { db } from '../db.js';
import { recipes, batches, f2VariantBatches, fermentationLogEntries } from '../schema.js';

const router = new Hono();

router.get('/', async (c) => {
  const [allRecipes, allBatches, allF2, allLogs] = await Promise.all([
    db.select().from(recipes),
    db.select().from(batches),
    db.select().from(f2VariantBatches),
    db.select().from(fermentationLogEntries),
  ]);

  const totalRecipes = allRecipes.length;
  const totalBatches = allBatches.length;
  const totalF2Variants = allF2.length;
  const totalLogs = allLogs.length;

  const activeBatches = allBatches.filter((b) =>
    ['fermenting_f1', 'ready_for_f2', 'fermenting_f2'].includes(b.status)
  ).length;

  const finishedBatches = allBatches.filter((b) => b.status === 'finished').length;
  const failedBatches = allBatches.filter((b) => b.status === 'failed').length;
  const successRate = totalBatches > 0 ? ((finishedBatches / totalBatches) * 100).toFixed(1) : '0';

  const totalVolume = allBatches.reduce((sum, b) => sum + parseFloat(b.total_volume_liters || '0'), 0);

  const topRatedVariants = allF2
    .filter((v) => v.tasting_rating !== null)
    .sort((a, b) => (b.tasting_rating ?? 0) - (a.tasting_rating ?? 0))
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      name: v.name,
      tasting_rating: v.tasting_rating,
      fruits_and_juices: v.fruits_and_juices,
    }));

  const batchesByStatus = allBatches.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const volumeOverTime = allBatches
    .filter((b) => b.start_date && b.total_volume_liters)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .reduce((acc, batch) => {
      const date = new Date(batch.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const existing = acc.find((e) => e.date === date);
      if (existing) {
        existing.volume += parseFloat(batch.total_volume_liters);
      } else {
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({ date, volume: parseFloat(batch.total_volume_liters), cumulative: prev + parseFloat(batch.total_volume_liters) });
      }
      return acc;
    }, [] as { date: string; volume: number; cumulative: number }[]);

  return c.json({
    totalRecipes,
    totalBatches,
    totalF2Variants,
    totalLogs,
    activeBatches,
    finishedBatches,
    failedBatches,
    successRate,
    totalVolume,
    topRatedVariants,
    batchesByStatus,
    volumeOverTime,
  });
});

export default router;
