import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import type { Sighting } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { BirdImage } from './BirdImage';

export function SightingCard({ sighting }: { sighting: Sighting }) {
  return (
    <Link
      to="/spotting/$sightingId"
      params={{ sightingId: sighting.id }}
      className="group flex items-center gap-3 py-3.5 transition-colors duration-150 hover:bg-paper/70"
    >
      <BirdImage
        src={sighting.bird_image_url}
        alt={`Foto ${sighting.bird_name}`}
        className="h-12 w-12 shrink-0 rounded-[4px] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-lg leading-tight text-forest-deep">
          {sighting.bird_name}
        </p>
        <p className="mt-0.5 truncate text-xs text-secondary">
          {sighting.location_name} · {sighting.observer_name}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[11px] text-muted">
          {formatDate(sighting.spotted_at)}
        </span>
        <ChevronRight
          className="h-3.5 w-3.5 text-muted transition-transform duration-150 group-hover:translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
