interface LessonCardProps {
  title: string;
  summary: string;
}

export function LessonCard({ title, summary }: LessonCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="text-lg font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>
    </div>
  );
}
