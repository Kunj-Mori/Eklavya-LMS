"use client";

import React, { useState, useEffect } from "react";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/SearchInput";
import { CourseList } from "@/components/CourseList";
import { motion } from "framer-motion";
import { BookOpen, Star } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CourseWithProgressWithCategory } from "@/types";

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

interface Category {
  id: string;
  name: string;
}

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithProgressWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching data with searchParams:", searchParams);
        
        // Fetch categories
        const categoriesResponse = await axios.get("/api/categories");
        console.log("Categories response:", categoriesResponse.data);
        setCategories(categoriesResponse.data || []);
        
        // Fetch courses
        const coursesResponse = await axios.get("/api/courses", {
          params: searchParams
        });
        console.log("Courses response:", coursesResponse.data);
        setCourses(coursesResponse.data || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[calc(100vh-3.5rem)]" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-20 h-20 mb-4">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading courses...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-3xl font-bold mb-3 relative inline-block">
            Explore Courses
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={headerInView ? { width: "100%" } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </h1>
          <p className="text-slate-600">Discover new skills and expand your knowledge</p>
        </motion.div>

        <Categories items={categories} />
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          {courses && courses.length > 0 ? (
            <CourseList items={courses} />
          ) : (
            <motion.div 
              className="theme-card flex flex-col items-center justify-center p-12 text-center mt-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <BookOpen className="h-20 w-20 text-blue-500 mb-6" />
                <motion.div
                  className="absolute -top-2 -right-2 text-yellow-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-6 w-6 fill-yellow-400" />
                </motion.div>
              </motion.div>
              <h2 className="text-2xl font-medium mb-3">No courses found</h2>
              <p className="text-slate-600 mb-6 max-w-md">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
