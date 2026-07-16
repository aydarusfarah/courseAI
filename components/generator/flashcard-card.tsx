interface FlashcardCardProps {
  front: string;
  back: string;
}

export function FlashcardCard({ front, back }: FlashcardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{front}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{back}</p>
    </div>
  );
}
