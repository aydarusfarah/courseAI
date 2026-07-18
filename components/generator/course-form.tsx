import { ReactNode } from "react";
import { Card } from "../card";

interface CourseFormProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function CourseForm({ title, description, children }: CourseFormProps) {
  return (
    <Card className="space-y-6 p-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </Card>
  );
}
