import { Chapter, Course, UserProgress } from "@prisma/client";
import NavbarRoutes from "@/components/NavbarRoutes";
import { CourseMobileSidebar } from "./CourseMobileSidebar"

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseNavbar = ({
  course,
  progressCount,
}: CourseNavbarProps) => {
  return (
    <div className="p-2 border-b h-full flex items-center  shadow-sm z-50 bg-white"> 
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  );
};
