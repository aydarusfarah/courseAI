interface QuizCardProps {
  question: string;
  answer: string;
}

export function QuizCard({ question, answer }: QuizCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{question}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{answer}</p>
    </div>
  );
}
