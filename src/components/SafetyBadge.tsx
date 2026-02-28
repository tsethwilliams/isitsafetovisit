interface SafetyBadgeProps {
  label: string;
  badgeClass: 'safe' | 'caution' | 'danger';
  size?: 'sm' | 'md';
}

export default function SafetyBadge({ label, badgeClass, size = 'sm' }: SafetyBadgeProps) {
  const colors = {
    safe: 'rgba(45, 122, 79, 0.9)',
    caution: 'rgba(184, 134, 11, 0.9)',
    danger: 'rgba(196, 50, 42, 0.9)',
  };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '5px 12px' : '6px 14px',
      borderRadius: 100, fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
      fontWeight: 700, letterSpacing: '0.04em',
      background: colors[badgeClass], color: '#fff',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {label}
    </span>
  );
}
