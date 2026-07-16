/**
 * Unit tests for lib/course.ts
 * Tests: serializeCoursePreview — data mapping from DB model to plain DTO
 */
import { serializeCoursePreview, type CourseWithDetails } from "../../lib/course";

// Minimal stub that satisfies the CourseWithDetails shape required by serializeCoursePreview
function makeCourse(overrides: Partial<CourseWithDetails> = {}): CourseWithDetails {
  return {
    id: "course-1",
    userId: "user-1",
    title: "Test Course",
    description: "A test course",
    topic: "Testing",
    audience: "Developers",
    difficulty: "BEGINNER",
    language: "English",
    tone: "Professional",
    lessonCount: 2,
    duration: "2 weeks",
    status: "DRAFT",
    coverImageUrl: null,
    archivedAt: null,
    deletedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    modules: [
      {
        id: "mod-1",
        courseId: "course-1",
        title: "Module 1",
        position: 1,
        deletedAt: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        lessons: [
          {
            id: "lesson-1",
            moduleId: "mod-1",
            title: "Lesson 1",
            content: "Content here",
            examples: "Example here",
            exercises: "Exercise here",
            position: 0,
            deletedAt: null,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            questionSet: {
              id: "quiz-1",
              lessonId: "lesson-1",
              deletedAt: null,
              createdAt: new Date("2024-01-01"),
              updatedAt: new Date("2024-01-01"),
              questions: [
                {
                  id: "q-1",
                  quizId: "quiz-1",
                  prompt: "What is JS?",
                  answer: "A language",
                  options: ["A language", "A framework", "A library", "An OS"],
                  deletedAt: null,
                  createdAt: new Date("2024-01-01"),
                  updatedAt: new Date("2024-01-01")
                }
              ]
            },
            flashcards: [
              {
                id: "fc-1",
                lessonId: "lesson-1",
                front: "Front text",
                back: "Back text",
                deletedAt: null,
                createdAt: new Date("2024-01-01"),
                updatedAt: new Date("2024-01-01")
              }
            ],
            assignments: [
              {
                id: "assign-1",
                lessonId: "lesson-1",
                title: "Build something",
                description: "Build a small project",
                dueDate: null,
                deletedAt: null,
                createdAt: new Date("2024-01-01"),
                updatedAt: new Date("2024-01-01")
              }
            ]
          }
        ]
      }
    ],
    certificate: {
      id: "cert-1",
      courseId: "course-1",
      content: "Certificate content",
      issuedAt: new Date("2024-01-01"),
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    ...overrides
  } as CourseWithDetails;
}

describe("serializeCoursePreview", () => {
  it("returns the course id, title, description, topic, difficulty, language", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.id).toBe("course-1");
    expect(preview.title).toBe("Test Course");
    expect(preview.description).toBe("A test course");
    expect(preview.topic).toBe("Testing");
    expect(preview.difficulty).toBe("BEGINNER");
    expect(preview.language).toBe("English");
  });

  it("maps modules with lesson title arrays", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.modules).toHaveLength(1);
    expect(preview.modules[0].title).toBe("Module 1");
    expect(preview.modules[0].lessons).toEqual(["Lesson 1"]);
  });

  it("maps quiz questions to quizzes array", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.quizzes).toHaveLength(1);
    expect(preview.quizzes[0].question).toBe("What is JS?");
    expect(preview.quizzes[0].answer).toBe("A language");
  });

  it("maps flashcards to the flashcards array", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.flashcards).toHaveLength(1);
    expect(preview.flashcards[0].front).toBe("Front text");
    expect(preview.flashcards[0].back).toBe("Back text");
  });

  it("maps assignments to the assignments array", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.assignments).toHaveLength(1);
    expect(preview.assignments[0].title).toBe("Build something");
    expect(preview.assignments[0].details).toBe("Build a small project");
  });

  it("includes certificate content when present", () => {
    const preview = serializeCoursePreview(makeCourse());
    expect(preview.certificateContent).toBe("Certificate content");
  });

  it("leaves certificateContent undefined when certificate is null", () => {
    const course = makeCourse({ certificate: null });
    const preview = serializeCoursePreview(course);
    expect(preview.certificateContent).toBeUndefined();
  });

  it("handles a course with no lessons", () => {
    const course = makeCourse({
      modules: [
        {
          id: "mod-empty",
          courseId: "course-1",
          title: "Empty Module",
          position: 1,
          deletedAt: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          lessons: []
        }
      ]
    });
    const preview = serializeCoursePreview(course);
    expect(preview.quizzes).toHaveLength(0);
    expect(preview.flashcards).toHaveLength(0);
    expect(preview.assignments).toHaveLength(0);
  });

  it("handles a course with no modules", () => {
    const course = makeCourse({ modules: [] });
    const preview = serializeCoursePreview(course);
    expect(preview.modules).toHaveLength(0);
    expect(preview.quizzes).toHaveLength(0);
  });

  it("handles a lesson with no questionSet", () => {
    const course = makeCourse();
    course.modules[0].lessons[0].questionSet = null;
    const preview = serializeCoursePreview(course);
    expect(preview.quizzes).toHaveLength(0);
  });
});
