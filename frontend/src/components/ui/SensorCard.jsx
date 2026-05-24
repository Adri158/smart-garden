import { cn } from '../../utils/cn';
import { getSensorStatus } from '../../data/sensorMeta';
import { formatSensorValue, timeAgo } from '../../services/formatService';

const STATUS_COLORS = {
  green: { border: '#22c55e', text: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  amber: { border: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  red:   { border: '#ef4444', text: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  muted: { border: '#374151', text: '#94a3b8', bg: 'rgba(55,65,81,0.08)' },
};

export default function SensorCard({
  meta,
  value,
  lastSeen,
  settings = {},
  loading = false,
  className,
}) {
  const status = getSensorStatus(meta.key, value, settings);
  const colors = STATUS_COLORS[status];
  const displayValue = formatSensorValue(meta.key, value);

  return (
    <div
      className={cn(
        'relative rounded-xl p-4 border transition-all duration-200',
        loading && 'opacity-60',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: colors.border,
        boxShadow: `0 0 0 1px ${colors.border}20`,
      }}
    >

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{meta.icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {meta.label}
        </span>
      </div>


      <div className="flex items-baseline gap-1">
        {loading ? (
          <div className="h-8 w-16 rounded bg-gray-800 animate-pulse" />
        ) : (
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: colors.text }}
          >
            {displayValue}
          </span>
        )}
      </div>


      {lastSeen && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(lastSeen)}
        </p>
      )}


      <div
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.border }}
        title={status}
      />
    </div>
  );
}
