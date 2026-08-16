import { cn } from '@/lib/utils';

type Props = {
  score: number;
  size?: 'sm' | 'md';
};

function scoreTier(score: number) {
  if (score >= 75) return { label: 'High', color: 'text-success', ring: 'stroke-success', bg: 'bg-success/10' };
  if (score >= 50) return { label: 'Good', color: 'text-primary', ring: 'stroke-primary', bg: 'bg-primary/10' };
  if (score >= 30) return { label: 'Low', color: 'text-warning', ring: 'stroke-warning', bg: 'bg-warning/10' };
  return { label: 'Poor', color: 'text-destructive', ring: 'stroke-destructive', bg: 'bg-destructive/10' };
}

export function DigitalScore({ score, size = 'md' }: Props) {
  const tier = scoreTier(score);
  const radius = size === 'sm' ? 18 : 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dim = size === 'sm' ? 44 : 52;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            strokeWidth="4"
            className="stroke-border"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={cn(tier.ring, 'transition-all duration-700 ease-out')}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-sm font-bold', tier.color)}>{score}</span>
        </div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Digital Score
        </span>
        <span className={cn('text-xs font-semibold', tier.color)}>
          {tier.label} · <span className="text-muted-foreground">/100</span>
        </span>
      </div>
    </div>
  );
}
