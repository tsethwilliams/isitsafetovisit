import { getScoreColor } from '@/lib/cities';

interface ScoreRowProps {
  label: string;
  score: number;
}

export default function ScoreRow({ label, score }: ScoreRowProps) {
  const color = getScoreColor(score);
  const barColors: Record<string, string> = { safe: 'var(--safe-green)', caution: 'var(--caution-amber)', danger: 'var(--danger-red)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--ink-light)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--paper-warm)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 10, width: `${score * 10}%`, background: barColors[color], transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', minWidth: 28, textAlign: 'right', color: 'var(--ink-muted)' }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}