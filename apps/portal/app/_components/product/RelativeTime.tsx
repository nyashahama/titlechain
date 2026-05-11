export function RelativeTime({ date }: { date: string }) {
  const timestamp = new Date(date).getTime();
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const label = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : `${minutes}m ago`;

  return (
    <time dateTime={date} className="text-[11px] text-tc-text-faint">
      {label}
    </time>
  );
}
