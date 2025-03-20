import { Category, Course } from "@prisma/client";

export type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

export type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};
