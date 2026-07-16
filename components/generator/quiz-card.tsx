interface QuizCardProps {
  question: string;
  answer: string;
}

export function QuizCard({ question, answer }: QuizCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-900">{question}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
    </div>
  );
}
