interface AssignmentCardProps {
  title: string;
  details: string;
}

export function AssignmentCard({ title, details }: AssignmentCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-lg font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{details}</p>
    </div>
  );
}
