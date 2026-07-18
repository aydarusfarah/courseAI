import { motion } from "framer-motion";

interface CourseCardProps {
  title: string;
  description: string;
  tags: string[];
}

export function CourseCard({ title, description, tags }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Preview</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
