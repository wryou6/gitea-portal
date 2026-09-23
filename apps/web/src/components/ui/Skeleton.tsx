export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`loading ${className}`} aria-hidden="true">
      載入中…
    </div>
  );
}
