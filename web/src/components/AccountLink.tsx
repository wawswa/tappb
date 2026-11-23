import { Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';

export function AccountLink({ className = '' }: { className?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <span className="font-mono text-[11px] text-muted">Akun</span>;
  }

  return (
    <Link
      to={user ? '/tentang' : '/masuk'}
      className={`font-mono text-[11px] text-forest transition-colors hover:text-forest-deep hover:underline ${className}`}
    >
      {user ? user.display_name : 'Masuk'}
    </Link>
  );
}
