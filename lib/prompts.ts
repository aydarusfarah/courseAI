export interface CourseGenerationInput {
  title: string;
  topic: string;
  description: string;
  audience: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  teachingStyle: string;
  tone: string;
  modules: number;
  lessonsPerModule: number;
  duration: string;
  exercises: boolean;
  quizzes: boolean;
  flashcards: boolean;
  assignments: boolean;
  finalProject: boolean;
  certificate: boolean;
  creativity: string;
  detailLevel: string;
  outputLength: string;
  readingLevel: string;
}

export function outlinePrompt(input: CourseGenerationInput) {
  return `You are a top-tier curriculum designer. Create a complete course outline for a course titled "${input.title}" on the topic of ${input.topic}. Course description: ${input.description}. The target audience is ${input.audience}. The difficulty is ${input.difficulty.toLowerCase()}. Deliver the course in ${input.language} with a ${input.tone.toLowerCase()} tone. Teaching style: ${input.teachingStyle}. Creativity: ${input.creativity}. Detail level: ${input.detailLevel}. Output length: ${input.outputLength}. Reading level: ${input.readingLevel}.

Include:
- A polished course description
- 5 learning objectives
- A course outline with ${input.modules} modules and ${input.lessonsPerModule} lessons per module
- Titles for each module and each lesson

Return only valid JSON. Example schema:
{
  "description": "...",
  "learningObjectives": ["...", "..."],
  "modules": [
    {
      "title": "...",
      "lessons": [
        { "title": "..." },
        { "title": "..." }
      ]
    }
  ]
}`;
}

export function lessonPrompt(input: CourseGenerationInput, modules: Array<{ title: string; lessons: { title: string }[] }>) {
  const moduleList = modules
    .map(
      (module) =>
        `Module: ${module.title}\n${module.lessons.map((lesson) => `- ${lesson.title}`).join("\n")}`
    )
    .join("\n\n");

  return `You are an expert instructional designer. Generate rich lesson-level content for the following course:\n\nTitle: ${input.title}\nTopic: ${input.topic}\nAudience: ${input.audience}\nDifficulty: ${input.difficulty.toLowerCase()}\nLanguage: ${input.language}\nTeaching Style: ${input.teachingStyle}\nTone: ${input.tone}\nDetail Level: ${input.detailLevel}\nOutput Length: ${input.outputLength}\nReading Level: ${input.readingLevel}\n\nModules and lessons:\n${moduleList}\n\nFor each lesson, create a JSON object with these fields: title, introduction, explanation, realWorldExample, bestPractices, commonMistakes, summary, exercise. Do not include any additional fields. Return only valid JSON with a top-level { "modules": [ ... ] } structure.`;
}

export function quizPrompt(input: CourseGenerationInput, lessons: Array<{ module: string; title: string }>) {
  const lessonList = lessons.map((lesson) => `- ${lesson.module} / ${lesson.title}`).join("\n");

  return `Create at least one multiple-choice quiz question for each lesson in this course. Course: ${input.title}. Lessons:\n${lessonList}\n\nReturn valid JSON with a top-level array named "quizzes". Each quiz item should include: lessonTitle, question, answer, options. Provide 3-4 answer options per question. Output only JSON.`;
}

export function flashcardsPrompt(input: CourseGenerationInput, lessons: Array<{ module: string; title: string }>) {
  const lessonList = lessons.map((lesson) => `- ${lesson.module} / ${lesson.title}`).join("\n");

  return `Generate one flashcard for each lesson in the course titled "${input.title}". Lessons:\n${lessonList}\n\nReturn valid JSON with a top-level array named "flashcards". Each item should include: lessonTitle, front, back. Output only JSON.`;
}

export function assignmentPrompt(input: CourseGenerationInput, lessons: Array<{ module: string; title: string }>) {
  const lessonList = lessons.map((lesson) => `- ${lesson.module} / ${lesson.title}`).join("\n");

  return `Create one practical assignment for each of the following lessons in the course "${input.title}":\n${lessonList}\n\nReturn valid JSON with a top-level array named "assignments". Each assignment should include: lessonTitle, title, description. Output only JSON.`;
}

export function projectPrompt(input: CourseGenerationInput) {
  return `Produce a final project summary for the course titled "${input.title}". Include a project title and a concise description of what the learner should build. Return valid JSON with: { "title": "...", "description": "..." }. Output only JSON.`;
}

export function certificatePrompt(input: CourseGenerationInput) {
  return `Write certificate metadata for the course titled "${input.title}". Include a polished certificate statement or content. Return valid JSON with: { "content": "..." }. Output only JSON.`;
}
