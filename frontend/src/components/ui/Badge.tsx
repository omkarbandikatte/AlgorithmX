interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full border border-accent-start/20 bg-accent-start/5 text-accent-start ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent-start animate-pulse" />
      {children}
    </span>
  );
}
