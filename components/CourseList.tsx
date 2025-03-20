"use client";

import { Category, Course } from "@prisma/client";
import { CourseCard } from "@/components/CourseCard";
import { CourseWithProgressWithCategory } from "@/types";
import { motion } from "framer-motion";

interface CoursesListProps {
  items: CourseWithProgressWithCategory[];
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export const CourseList = ({ items }: CoursesListProps) => {
  return (
    <div>
      <motion.div 
        className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={item}>
            <CourseCard
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl!}
              chaptersLength={item.chapters.length}
              price={item.price!}
              progress={item.progress}
              category={item?.category?.name!}
            />
          </motion.div>
        ))}
      </motion.div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No courses found
        </div>
      )}
    </div>
  );
};
