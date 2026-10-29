const RADIUS = 15.9155;
const GAP = 0.8;

export default function CategoryDonut({ slices, total, centerValue, centerLabel, label }) {
  const visible = slices.filter((slice) => slice.value > 0);
  const arcs = visible.map((slice, index) => {
    const share = (slice.value / total) * 100;
    const start = visible.slice(0, index).reduce((sum, previous) => sum + (previous.value / total) * 100, 0);
    return { ...slice, length: visible.length > 1 ? Math.max(share - GAP, 0.1) : share, start };
  });

  return (
    <svg viewBox="0 0 42 42" role="img" aria-label={label} className="mx-auto block w-full max-w-[15rem]">
      <circle cx="21" cy="21" r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      {arcs.map((arc) => (
        <circle
          key={arc.key}
          cx="21"
          cy="21"
          r={RADIUS}
          fill="none"
          stroke={arc.color}
          strokeWidth="5"
          strokeDasharray={`${arc.length} ${100 - arc.length}`}
          strokeDashoffset={25 - arc.start}
        />
      ))}
      <text x="21" y="21.6" textAnchor="middle" className="fill-foreground font-display" fontSize="6.4" fontWeight="600">
        {centerValue}
      </text>
      <text x="21" y="27" textAnchor="middle" className="fill-muted-foreground" fontSize="2.8">
        {centerLabel}
      </text>
    </svg>
  );
}
