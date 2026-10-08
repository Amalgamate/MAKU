import { initials } from '@maku/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const classes = [
    'inline-flex items-center justify-center rounded-full bg-brand-700 text-white font-semibold select-none shrink-0',
    sizeClasses[size],
    className,
  ]
    .join(' ')
    .trim();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={['rounded-full object-cover', sizeClasses[size], className].join(' ')}
      />
    );
  }

  return <span className={classes}>{initials(name)}</span>;
}
