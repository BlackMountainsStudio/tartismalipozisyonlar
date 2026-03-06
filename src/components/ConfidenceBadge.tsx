interface ConfidenceBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ConfidenceBadge({
  score,
  size = "md",
}: ConfidenceBadgeProps) {
  const percentage = Math.round(score * 100);

  let colorClass: string;
  let label: string;

  if (score >= 0.8) {
    colorClass = "bg-red-500/15 text-red-400 ring-red-500/30";
    label = "High";
  } else if (score >= 0.5) {
    colorClass = "bg-amber-500/15 text-amber-400 ring-amber-500/30";
    label = "Medium";
  } else {
    colorClass = "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30";
    label = "Low";
  }

  const sizeClass = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset ${colorClass} ${sizeClass}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          score >= 0.8
            ? "bg-red-400"
            : score >= 0.5
              ? "bg-amber-400"
              : "bg-zinc-400"
        }`}
      />
      {percentage}% {label}
    </span>
  );
}
