interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: 'success' | 'primary' | 'warning' | 'accent' | 'destructive';
  testId?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color,
  testId,
}: StatsCardProps) {
  const colorClasses = {
    success: 'text-success',
    primary: 'text-primary',
    warning: 'text-warning',
    accent: 'text-accent',
    destructive: 'text-destructive',
  };

  return (
    <div className="bg-card rounded-lg p-4 border shadow-sm" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <i className={`${icon} ${colorClasses[color]}`}></i>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`} data-testid={`text-${testId}`}>
        {value}
      </p>
      {change && (
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      )}
    </div>
  );
}
