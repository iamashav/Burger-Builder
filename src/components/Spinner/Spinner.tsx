export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status">
      <span className="size-8 animate-spin rounded-full border-2 border-ash border-t-flood" />
      <span className="section-label">{label}</span>
    </div>
  );
}
