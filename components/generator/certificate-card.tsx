interface CertificateCardProps {
  courseTitle: string;
  studentName: string;
}

export function CertificateCard({ courseTitle, studentName }: CertificateCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Certificate of Completion</p>
      <h3 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">{studentName}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">has completed</p>
      <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{courseTitle}</p>
      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Validated by CourseAI</p>
    </div>
  );
}
