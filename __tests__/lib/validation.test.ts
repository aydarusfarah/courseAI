/**
 * Unit tests for lib/validation/generation.ts
 * Tests: generatorFormSchema validation + mapFormToGenerationInput
 */
import { generatorFormSchema, mapFormToGenerationInput, type GeneratorFormValues } from "../../lib/validation/generation";

const valid: GeneratorFormValues = {
  title: "AI Product Strategy Bootcamp",
  topic: "Product Strategy",
  description: "A practical course on building product strategy using AI frameworks.",
  audience: "Product managers and founders",
  difficulty: "Intermediate",
  language: "English",
  teachingStyle: "Project-based",
  tone: "Professional",
  modules: 6,
  lessonsPerModule: 4,
  duration: "8 weeks",
  exercises: true,
  quizzes: true,
  flashcards: false,
  assignments: true,
  finalProject: true,
  certificate: false,
  creativity: "High",
  detailLevel: "Balanced",
  outputLength: "Medium",
  readingLevel: "High school",
  generateSlides: true,
  generatePdf: false
};

describe("generatorFormSchema", () => {
  it("accepts a fully valid form object", () => {
    const result = generatorFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 5 characters", () => {
    const result = generatorFormSchema.safeParse({ ...valid, title: "AI" });
    expect(result.success).toBe(false);
  });

  it("rejects a topic shorter than 3 characters", () => {
    const result = generatorFormSchema.safeParse({ ...valid, topic: "AI" });
    expect(result.success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    const result = generatorFormSchema.safeParse({ ...valid, description: "Short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid difficulty value", () => {
    const result = generatorFormSchema.safeParse({ ...valid, difficulty: "Expert" });
    expect(result.success).toBe(false);
  });

  it("rejects modules count outside 1-20 range", () => {
    expect(generatorFormSchema.safeParse({ ...valid, modules: 0 }).success).toBe(false);
    expect(generatorFormSchema.safeParse({ ...valid, modules: 21 }).success).toBe(false);
  });

  it("rejects an invalid duration enum", () => {
    const result = generatorFormSchema.safeParse({ ...valid, duration: "6 weeks" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid tone enum", () => {
    const result = generatorFormSchema.safeParse({ ...valid, tone: "Sarcastic" });
    expect(result.success).toBe(false);
  });

  it("accepts all four teaching styles", () => {
    const styles = ["Lecture", "Hands-on", "Project-based", "Discussion"] as const;
    for (const style of styles) {
      expect(generatorFormSchema.safeParse({ ...valid, teachingStyle: style }).success).toBe(true);
    }
  });
});

describe("mapFormToGenerationInput", () => {
  it("maps Beginner → BEGINNER", () => {
    const result = mapFormToGenerationInput({ ...valid, difficulty: "Beginner" });
    expect(result.difficulty).toBe("BEGINNER");
  });

  it("maps Intermediate → INTERMEDIATE", () => {
    const result = mapFormToGenerationInput({ ...valid, difficulty: "Intermediate" });
    expect(result.difficulty).toBe("INTERMEDIATE");
  });

  it("maps Advanced → ADVANCED", () => {
    const result = mapFormToGenerationInput({ ...valid, difficulty: "Advanced" });
    expect(result.difficulty).toBe("ADVANCED");
  });

  it("preserves boolean flags", () => {
    const result = mapFormToGenerationInput({ ...valid, quizzes: false, flashcards: true });
    expect(result.quizzes).toBe(false);
    expect(result.flashcards).toBe(true);
  });

  it("propagates modules and lessonsPerModule numerically", () => {
    const result = mapFormToGenerationInput({ ...valid, modules: 4, lessonsPerModule: 3 });
    expect(result.modules).toBe(4);
    expect(result.lessonsPerModule).toBe(3);
  });

  it("does not include generateSlides / generatePdf in the generation input", () => {
    const result = mapFormToGenerationInput(valid) as unknown as Record<string, unknown>;
    expect(result["generateSlides"]).toBeUndefined();
    expect(result["generatePdf"]).toBeUndefined();
  });
});
