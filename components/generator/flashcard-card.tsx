interface FlashcardCardProps {
  front: string;
  back: string;
}

export function FlashcardCard({ front, back }: FlashcardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{front}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{back}</p>
    </div>
  );
}
