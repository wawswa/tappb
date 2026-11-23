import type { ConservationStatus } from './api';

export const CONSERVATION_INFO: Record<
  ConservationStatus,
  { label: string; dotClassName: string }
> = {
  LC: { label: 'Risiko rendah', dotClassName: 'bg-emerald-700' },
  NT: { label: 'Hampir terancam', dotClassName: 'bg-amber-600' },
  VU: { label: 'Rentan', dotClassName: 'bg-orange-600' },
  EN: { label: 'Terancam', dotClassName: 'bg-red-700' },
  CR: { label: 'Kritis', dotClassName: 'bg-red-950' },
};
