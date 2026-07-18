interface AssignmentCardProps {
  title: string;
  details: string;
}

export function AssignmentCard({ title, details }: AssignmentCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{details}</p>
    </div>
  );
}
