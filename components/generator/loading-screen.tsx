import { motion } from "framer-motion";

interface LoadingScreenProps {
  progress: number;
  label?: string;
}

export function LoadingScreen({ progress, label }: LoadingScreenProps) {
  return (
    <div className="grid min-h-[480px] place-items-center rounded-3xl border border-slate-200 bg-white p-10 shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-6 text-center"
      >
        <p className="text-sm uppercase tracking-[0.28em] text-brand-600">Generating course</p>
        <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">Building your course content</h3>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {label ?? "This may take a few moments while AI generates your course."}
        </p>
        <div className="rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-700">
          <div className="h-3 rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{progress}% complete</p>
      </motion.div>
    </div>
  );
}
