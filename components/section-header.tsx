interface SectionHeaderProps {
  title: string;
  description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
