"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CoursePreviewData } from "../../lib/course";
import { Button } from "../button";
import { CourseCard } from "./course-card";
import { ModuleCard } from "./module-card";
import { QuizCard } from "./quiz-card";
import { FlashcardCard } from "./flashcard-card";
import { AssignmentCard } from "./assignment-card";
import { CertificateCard } from "./certificate-card";

interface CoursePreviewProps {
  course: CoursePreviewData;
  showViewLink?: boolean;
}

export function CoursePreview({ course, showViewLink = false }: CoursePreviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <CourseCard
        title={course.title}
        description={course.description}
        tags={[course.topic, course.difficulty, course.language]}
      />

      {course.modules.length > 0 && (
        <div className="grid gap-6">
          {course.modules.map((module) => (
            <ModuleCard key={module.title} title={module.title} lessons={module.lessons} />
          ))}
        </div>
      )}

      {course.quizzes.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          {course.quizzes.map((quiz) => (
            <QuizCard key={`${quiz.question}-${quiz.answer}`} question={quiz.question} answer={quiz.answer} />
          ))}
        </div>
      )}

      {course.flashcards.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          {course.flashcards.map((flashcard) => (
            <FlashcardCard key={`${flashcard.front}-${flashcard.back}`} front={flashcard.front} back={flashcard.back} />
          ))}
        </div>
      )}

      {course.assignments.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          {course.assignments.map((assignment) => (
            <AssignmentCard key={assignment.title} title={assignment.title} details={assignment.details} />
          ))}
        </div>
      )}

      {course.certificateContent && (
        <CertificateCard courseTitle={course.title} studentName="Student Name" />
      )}

      {showViewLink && (
        <div className="flex flex-wrap gap-3">
          <Link href={`/courses/${course.id}`}>
            <Button>View full course</Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
