import { cn } from '../../utils/cn';

const PRESETS = {
  ONLINE:  { label: 'ONLINE',  bg: '#14532d', text: '#22c55e', dot: '#22c55e' },
  OFFLINE: { label: 'OFFLINE', bg: '#450a0a', text: '#ef4444', dot: '#ef4444' },
  AUTO:    { label: 'AUTO',    bg: '#1e3a5f', text: '#3b82f6', dot: '#3b82f6' },
  MANUAL:  { label: 'MANUAL', bg: '#451a03', text: '#f59e0b', dot: '#f59e0b' },
  ON:      { label: 'ON',     bg: '#14532d', text: '#22c55e', dot: '#22c55e' },
  OFF:     { label: 'OFF',    bg: '#1f2937', text: '#94a3b8', dot: '#94a3b8' },
};

export default function StatusBadge({ status, label, pulse = false, className }) {
  const preset = PRESETS[status?.toUpperCase()] ?? {
    label: status ?? '—',
    bg: '#1f2937',
    text: '#94a3b8',
    dot: '#94a3b8',
  };

  const displayLabel = label ?? preset.label;
  const shouldPulse = pulse && status === 'ONLINE';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        className
      )}
      style={{ backgroundColor: preset.bg, color: preset.text }}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', shouldPulse && 'animate-pulse')}
        style={{ backgroundColor: preset.dot }}
      />
      {displayLabel}
    </span>
  );
}
