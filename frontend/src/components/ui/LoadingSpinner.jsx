import { cn } from '../../utils/cn';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-t-transparent animate-spin',
        sizeMap[size] ?? sizeMap.md,
        className
      )}
      style={{ borderColor: 'var(--blue)', borderTopColor: 'transparent' }}
    />
  );
}
