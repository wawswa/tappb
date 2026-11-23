import { useState } from 'react';

const PLACEHOLDER = '/birds/placeholder.svg';

export function BirdImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? PLACEHOLDER : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (resolved !== PLACEHOLDER) setFailed(true);
      }}
    />
  );
}
