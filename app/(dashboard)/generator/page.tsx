"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { CourseForm } from "../../../components/generator/course-form";
import { ProgressIndicator } from "../../../components/generator/progress-indicator";
import { StepNavigation } from "../../../components/generator/step-navigation";
import { LoadingScreen } from "../../../components/generator/loading-screen";
import { CourseCard } from "../../../components/generator/course-card";
import { CoursePreview } from "../../../components/generator/course-preview";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import {
  generatorFormSchema,
  type GeneratorFormValues
} from "../../../lib/validation/generation";
import type { CoursePreviewData } from "../../../lib/course";

const steps = ["Course Information", "Course Structure", "AI Options", "Review"];

const defaultValues: GeneratorFormValues = {
  title: "AI Product Strategy Bootcamp",
  topic: "Product Strategy",
  description: "A practical course on building product strategy with AI-assisted frameworks and real-world examples.",
  audience: "Product managers, founders, and educators",
  difficulty: "Intermediate",
  language: "English",
  teachingStyle: "Project-based",
  tone: "Professional",
  modules: 6,
  lessonsPerModule: 4,
  duration: "8 weeks",
  exercises: true,
  quizzes: true,
  flashcards: true,
  assignments: true,
  finalProject: true,
  certificate: true,
  creativity: "High",
  detailLevel: "Balanced",
  outputLength: "Medium",
  readingLevel: "High school",
  generateSlides: true,
  generatePdf: true
};

interface StreamEvent {
  type: "progress" | "complete" | "error";
  step?: string;
  percent?: number;
  label?: string;
  courseId?: string;
  message?: string;
}

async function generateCourseStream(
  values: GeneratorFormValues,
  onProgress: (percent: number, label: string) => void
): Promise<string> {
  const response = await fetch("/api/courses/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Failed to start course generation.");
  }

  if (!response.body) {
    throw new Error("No response stream received.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let courseId = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as StreamEvent;

      if (event.type === "progress" && event.percent !== undefined) {
        onProgress(event.percent, event.label ?? "Generating course...");
      }

      if (event.type === "complete" && event.courseId) {
        courseId = event.courseId;
        onProgress(100, "Course generated successfully");
      }

      if (event.type === "error") {
        throw new Error(event.message ?? "Course generation failed.");
      }
    }
  }

  if (!courseId) {
    throw new Error("Generation completed without a course ID.");
  }

  return courseId;
}

async function fetchCoursePreview(courseId: string): Promise<CoursePreviewData> {
  const response = await fetch(`/api/courses/${courseId}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Failed to load generated course.");
  }
  const data = (await response.json()) as { course: CoursePreviewData };
  return data.course;
}

export default function GeneratorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Preparing generation...");
  const [previewReady, setPreviewReady] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CoursePreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorFormSchema),
    defaultValues,
    mode: "onChange"
  });

  const watchAll = watch();

  const handleGenerate = async (values: GeneratorFormValues) => {
    setIsGenerating(true);
    setProgress(0);
    setProgressLabel("Starting generation...");
    setPreviewReady(false);
    setGeneratedCourse(null);
    setError(null);

    try {
      const courseId = await generateCourseStream(values, (percent, label) => {
        setProgress(percent);
        setProgressLabel(label);
      });

      const course = await fetchCoursePreview(courseId);
      setGeneratedCourse(course);
      setPreviewReady(true);
    } catch (generationError) {
      const message =
        generationError instanceof Error ? generationError.message : "Course generation failed.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      void handleSubmit(handleGenerate)();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = isValid;

  const reviewRows = useMemo(
    () => [
      { label: "Course Title", value: watchAll.title },
      { label: "Topic", value: watchAll.topic },
      { label: "Description", value: watchAll.description },
      { label: "Audience", value: watchAll.audience },
      { label: "Difficulty", value: watchAll.difficulty },
      { label: "Language", value: watchAll.language },
      { label: "Teaching Style", value: watchAll.teachingStyle },
      { label: "Tone", value: watchAll.tone },
      { label: "Modules", value: watchAll.modules },
      { label: "Lessons per Module", value: watchAll.lessonsPerModule },
      { label: "Duration", value: watchAll.duration },
      { label: "Exercises", value: watchAll.exercises ? "Yes" : "No" },
      { label: "Quizzes", value: watchAll.quizzes ? "Yes" : "No" },
      { label: "Flashcards", value: watchAll.flashcards ? "Yes" : "No" },
      { label: "Assignments", value: watchAll.assignments ? "Yes" : "No" },
      { label: "Final Project", value: watchAll.finalProject ? "Yes" : "No" },
      { label: "Certificate", value: watchAll.certificate ? "Yes" : "No" },
      { label: "Creativity", value: watchAll.creativity },
      { label: "Detail Level", value: watchAll.detailLevel },
      { label: "Output Length", value: watchAll.outputLength },
      { label: "Reading Level", value: watchAll.readingLevel },
      { label: "Generate Slides", value: watchAll.generateSlides ? "Yes" : "No" },
      { label: "Generate PDF", value: watchAll.generatePdf ? "Yes" : "No" }
    ],
    [watchAll]
  );

  return (
    <div className="space-y-8">
      <SectionHeader title="AI Course Generator" description="Build a custom course with AI-ready settings and preview the final curriculum before generation." />
      <Card className="space-y-8">
        <ProgressIndicator steps={steps} currentStep={currentStep} />
        <form onSubmit={handleSubmit(handleGenerate)} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <CourseForm title={steps[currentStep]} description="Complete the required details for this step.">
                {currentStep === 0 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Course Title</label>
                      <Input {...register("title")} />
                      {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Topic</label>
                      <Input {...register("topic")} />
                      {errors.topic && <p className="text-sm text-red-600">{errors.topic.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <Textarea {...register("description")} />
                      {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Audience</label>
                      <Input {...register("audience")} />
                      {errors.audience && <p className="text-sm text-red-600">{errors.audience.message}</p>}
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Difficulty</label>
                        <Select {...register("difficulty")}>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Language</label>
                        <Input {...register("language")} />
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Teaching Style</label>
                        <Select {...register("teachingStyle")}>
                          <option>Lecture</option>
                          <option>Hands-on</option>
                          <option>Project-based</option>
                          <option>Discussion</option>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Tone</label>
                        <Select {...register("tone")}>
                          <option>Professional</option>
                          <option>Friendly</option>
                          <option>Inspirational</option>
                          <option>Concise</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="grid gap-6">
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Number of Modules</label>
                        <Input type="number" min={1} max={20} {...register("modules", { valueAsNumber: true })} />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Lessons per Module</label>
                        <Input type="number" min={1} max={20} {...register("lessonsPerModule", { valueAsNumber: true })} />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Course Duration</label>
                        <Select {...register("duration")}>
                          <option>2 weeks</option>
                          <option>4 weeks</option>
                          <option>8 weeks</option>
                          <option>12 weeks</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Switch id="exercises" label="Include Exercises" {...register("exercises")} checked={watchAll.exercises} />
                      <Switch id="quizzes" label="Include Quizzes" {...register("quizzes")} checked={watchAll.quizzes} />
                      <Switch id="flashcards" label="Include Flashcards" {...register("flashcards")} checked={watchAll.flashcards} />
                      <Switch id="assignments" label="Include Assignments" {...register("assignments")} checked={watchAll.assignments} />
                      <Switch id="finalProject" label="Include Final Project" {...register("finalProject")} checked={watchAll.finalProject} />
                      <Switch id="certificate" label="Include Certificate" {...register("certificate")} checked={watchAll.certificate} />
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="grid gap-6">
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Creativity</label>
                        <Select {...register("creativity")}>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Detail Level</label>
                        <Select {...register("detailLevel")}>
                          <option>Concise</option>
                          <option>Balanced</option>
                          <option>Thorough</option>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Output Length</label>
                        <Select {...register("outputLength")}>
                          <option>Short</option>
                          <option>Medium</option>
                          <option>Long</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">Target Reading Level</label>
                        <Select {...register("readingLevel")}>
                          <option>Middle school</option>
                          <option>High school</option>
                          <option>College</option>
                        </Select>
                      </div>
                      <div className="grid gap-4">
                        <Switch id="generateSlides" label="Generate Slides" {...register("generateSlides")} checked={watchAll.generateSlides} />
                        <Switch id="generatePdf" label="Generate PDF" {...register("generatePdf")} checked={watchAll.generatePdf} />
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="grid gap-4">
                    {reviewRows.map((row) => (
                      <div key={row.label} className="grid gap-1 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">{row.label}</p>
                        <p className="text-sm text-slate-600">{String(row.value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CourseForm>

              {error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <Card className="space-y-6 p-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Preview</p>
                  <h3 className="text-xl font-semibold text-slate-950">Live course preview</h3>
                </div>
                <CourseCard title={watchAll.title} description={watchAll.description} tags={[watchAll.topic, watchAll.difficulty, watchAll.language]} />
              </Card>
              {previewReady && generatedCourse && (
                <CoursePreview course={generatedCourse} showViewLink />
              )}
              {isGenerating && <LoadingScreen progress={progress} label={progressLabel} />}
            </div>
          </div>
          <StepNavigation
            canProceed={canProceed}
            isSubmitting={isGenerating}
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={handleBack}
            onNext={handleNext}
          />
        </form>
      </Card>
    </div>
  );
}
