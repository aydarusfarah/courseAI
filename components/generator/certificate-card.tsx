interface CertificateCardProps {
  courseTitle: string;
  studentName: string;
}

export function CertificateCard({ courseTitle, studentName }: CertificateCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Certificate of Completion</p>
      <h3 className="mt-6 text-2xl font-semibold text-slate-950">{studentName}</h3>
      <p className="mt-1 text-sm text-slate-600">has completed</p>
      <p className="mt-3 text-xl font-semibold text-slate-900">{courseTitle}</p>
      <p className="mt-6 text-sm text-slate-500">Validated by CourseAI</p>
    </div>
  );
}
