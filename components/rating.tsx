type RatingProps = {
  value?: number;
  className?: string;
};

export function Rating({ value, className }: RatingProps) {
  if (!value) {
    return <span className={className}>—</span>;
  }

  return (
    <span className={className}>
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">/100</span>
    </span>
  );
}
