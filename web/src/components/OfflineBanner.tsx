import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-forest-deep/10 bg-amber px-4 py-2 text-center text-[11px] font-medium text-forest-deep"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      Mode offline — data tersimpan tetap dapat dibaca.
    </div>
  );
}
