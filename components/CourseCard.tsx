"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

import { IconBadge } from "@/components/Iconbadge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/CourseProgress";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
};

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <motion.div 
        className="group overflow-hidden border rounded-lg p-3 h-full theme-card"
        whileHover={{ 
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 0.3)"
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            alt={title}
            src={imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex flex-col pt-3">
          <motion.div 
            className="text-lg md:text-base font-medium group-hover:text-blue-600 transition line-clamp-2"
            transition={{ type: "spring", stiffness: 100 }}
          >
            {title}
          </motion.div>
          <motion.p 
            className="text-xs text-muted-foreground mt-1"
            whileHover={{ color: "rgba(37, 99, 235, 0.8)" }}
          >
            {category}
          </motion.p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <motion.p 
              className="text-md md:text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {formatPrice(price)}
            </motion.p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}