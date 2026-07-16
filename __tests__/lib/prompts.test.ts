/**
 * Unit tests for lib/prompts.ts
 * Tests: all exported prompt builder functions
 */
import {
  outlinePrompt,
  lessonPrompt,
  quizPrompt,
  flashcardsPrompt,
  assignmentPrompt,
  projectPrompt,
  certificatePrompt,
  type CourseGenerationInput
} from "../../lib/prompts";

const base: CourseGenerationInput = {
  title: "JavaScript for Beginners",
  topic: "JavaScript",
  description: "Learn the fundamentals of JavaScript programming.",
  audience: "Absolute beginners with no coding experience",
  difficulty: "BEGINNER",
  language: "English",
  teachingStyle: "Hands-on",
  tone: "Friendly",
  modules: 3,
  lessonsPerModule: 2,
  duration: "4 weeks",
  exercises: true,
  quizzes: true,
  flashcards: true,
  assignments: true,
  finalProject: true,
  certificate: true,
  creativity: "Medium",
  detailLevel: "Balanced",
  outputLength: "Medium",
  readingLevel: "High school"
};

const modules = [
  { title: "Module 1: Basics", lessons: [{ title: "Variables" }, { title: "Data Types" }] },
  { title: "Module 2: Control Flow", lessons: [{ title: "If Statements" }, { title: "Loops" }] }
];

const lessonList = [
  { module: "Module 1: Basics", title: "Variables" },
  { module: "Module 1: Basics", title: "Data Types" },
  { module: "Module 2: Control Flow", title: "If Statements" },
  { module: "Module 2: Control Flow", title: "Loops" }
];

describe("outlinePrompt", () => {
  it("includes the course title", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("includes the topic", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("JavaScript");
  });

  it("includes module count", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("3 modules");
  });

  it("includes lessons per module count", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("2 lessons per module");
  });

  it("requests JSON output", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("JSON");
  });

  it("includes the difficulty in lowercase", () => {
    const prompt = outlinePrompt(base);
    expect(prompt).toContain("beginner");
  });
});

describe("lessonPrompt", () => {
  it("includes the course title", () => {
    const prompt = lessonPrompt(base, modules);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("includes all module titles", () => {
    const prompt = lessonPrompt(base, modules);
    expect(prompt).toContain("Module 1: Basics");
    expect(prompt).toContain("Module 2: Control Flow");
  });

  it("includes lesson titles", () => {
    const prompt = lessonPrompt(base, modules);
    expect(prompt).toContain("Variables");
    expect(prompt).toContain("If Statements");
  });

  it("requests JSON output with modules array", () => {
    const prompt = lessonPrompt(base, modules);
    expect(prompt).toContain('"modules"');
  });
});

describe("quizPrompt", () => {
  it("includes the course title", () => {
    const prompt = quizPrompt(base, lessonList);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("includes all lesson/module pairs", () => {
    const prompt = quizPrompt(base, lessonList);
    expect(prompt).toContain("Module 1: Basics / Variables");
    expect(prompt).toContain("Module 2: Control Flow / Loops");
  });

  it("requests a quizzes JSON array", () => {
    const prompt = quizPrompt(base, lessonList);
    expect(prompt).toContain('"quizzes"');
  });
});

describe("flashcardsPrompt", () => {
  it("includes the course title", () => {
    const prompt = flashcardsPrompt(base, lessonList);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("requests a flashcards JSON array", () => {
    const prompt = flashcardsPrompt(base, lessonList);
    expect(prompt).toContain('"flashcards"');
  });

  it("includes all lesson titles", () => {
    const prompt = flashcardsPrompt(base, lessonList);
    expect(prompt).toContain("Variables");
    expect(prompt).toContain("Data Types");
  });
});

describe("assignmentPrompt", () => {
  it("includes the course title", () => {
    const prompt = assignmentPrompt(base, lessonList);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("requests an assignments JSON array", () => {
    const prompt = assignmentPrompt(base, lessonList);
    expect(prompt).toContain('"assignments"');
  });
});

describe("projectPrompt", () => {
  it("includes the course title", () => {
    const prompt = projectPrompt(base);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("requests title and description fields", () => {
    const prompt = projectPrompt(base);
    expect(prompt).toContain('"title"');
    expect(prompt).toContain('"description"');
  });
});

describe("certificatePrompt", () => {
  it("includes the course title", () => {
    const prompt = certificatePrompt(base);
    expect(prompt).toContain("JavaScript for Beginners");
  });

  it("requests a content field", () => {
    const prompt = certificatePrompt(base);
    expect(prompt).toContain('"content"');
  });
});
