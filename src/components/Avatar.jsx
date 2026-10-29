import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Avatar({ user, className }) {
  const [failedUrl, setFailedUrl] = useState(null);

  if (user.avatarUrl && failedUrl !== user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(user.avatarUrl)}
        className={cn('shrink-0 rounded-full bg-muted object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-content-center rounded-full bg-primary-soft font-semibold text-accent-foreground', className)}
    >
      {user.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
