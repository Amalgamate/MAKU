interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        paddingClasses[padding],
        className,
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </div>
  );
}
