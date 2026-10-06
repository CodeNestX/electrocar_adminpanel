export default function StatCard({
  title,
  value,
  hint,
  icon,
  accent = "green",
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent?: "green" | "blue" | "amber" | "violet";
}) {
  const accents: Record<string, string> = {
    green: "bg-[#39f77b]/10 text-[#39f77b]",
    blue: "bg-[#00c8ff]/10 text-[#00c8ff]",
    amber: "bg-amber-400/10 text-amber-300",
    violet: "bg-violet-400/10 text-violet-300",
  };
  return (
    <div className="ev-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-white/40">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
          <p className="mt-1.5 text-[11px] text-white/40">{hint}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accents[accent]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
