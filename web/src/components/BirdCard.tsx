import { Link } from '@tanstack/react-router';
import type { Bird } from '@/lib/api';
import { BirdImage } from './BirdImage';
import { ConservationBadge } from './ConservationBadge';

export function BirdCard({ bird, index }: { bird: Bird; index: number }) {
  return (
    <Link
      to="/burung/$birdId"
      params={{ birdId: bird.id }}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-rule bg-paper transition-colors duration-150 hover:border-forest/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand/30">
        <BirdImage
          src={bird.image_url}
          alt={`Foto ${bird.name}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-[4px] bg-paper/95 px-2 py-1 font-mono text-[11px] text-ink">
          No. {String(index + 1).padStart(3, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <ConservationBadge status={bird.conservation_status} />
          <span className="font-mono text-[11px] text-muted">
            {bird.sighting_count} catatan
          </span>
        </div>
        <h2 className="mt-2.5 text-[1.35rem] leading-tight text-forest-deep">
          {bird.name}
        </h2>
        <p className="mt-0.5 text-sm italic text-secondary">{bird.scientific_name}</p>
        <p className="mt-auto pt-3 font-mono text-[11px] text-muted">{bird.family}</p>
      </div>
    </Link>
  );
}
