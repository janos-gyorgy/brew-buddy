import type { BatchStatus, F2Status } from './types';

const BATCH_STATUS_COLORS: Record<BatchStatus, string> = {
  planned: 'bg-muted text-muted-foreground',
  fermenting_f1: 'bg-info text-info-foreground',
  ready_for_f2: 'bg-warning text-warning-foreground',
  fermenting_f2: 'bg-info text-info-foreground',
  cold_crash: 'bg-accent text-accent-foreground',
  bottled: 'bg-secondary text-secondary-foreground',
  finished: 'bg-success text-success-foreground',
  failed: 'bg-destructive text-destructive-foreground',
};

const F2_STATUS_COLORS: Record<F2Status, string> = {
  fermenting: 'bg-info text-info-foreground',
  cold_crash: 'bg-accent text-accent-foreground',
  ready: 'bg-success text-success-foreground',
  consumed: 'bg-muted text-muted-foreground',
  failed: 'bg-destructive text-destructive-foreground',
};

export const getBatchStatusColor = (status: BatchStatus): string =>
  BATCH_STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';

export const getF2StatusColor = (status: F2Status): string =>
  F2_STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground';

export const formatStatus = (status: string): string =>
  status.replace(/_/g, ' ');
