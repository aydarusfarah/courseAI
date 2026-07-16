interface ModuleCardProps {
  title: string;
  lessons: string[];
}

export function ModuleCard({ title, lessons }: ModuleCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-lg font-semibold text-slate-950">{title}</h4>
      <div className="mt-4 space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{lesson}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
