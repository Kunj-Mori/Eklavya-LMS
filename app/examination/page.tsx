"use client";

import { useState, useEffect } from "react";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar, BookOpen, MonitorPlay, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessmentType: string;
  questionFormat: string | string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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

export default function ExaminationPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: headerRef, inView: headerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchPublishedAssessments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/assessments/published");
        setAssessments(response.data || []);
      } catch (error) {
        console.error("Error fetching published assessments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedAssessments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

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
            Loading assessments...
          </p>
        </motion.div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.h1 
          className="text-3xl font-bold mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Available Assessments
          <motion.div 
            className="absolute bottom-0 left-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: "24" }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.h1>
        
        <motion.div 
          className="theme-card flex flex-col items-center justify-center p-12 text-center"
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
          <h2 className="text-2xl font-medium mb-3">No assessments available</h2>
          <p className="text-slate-600 mb-6 max-w-md">
            There are no published assessments available for you at the moment. Please check back later.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              onClick={() => router.push("/")}
              className="theme-btn flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Return to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto" style={{background: 'hsl(var(--theme-bg))'}}>
      <motion.div 
        ref={headerRef}
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-3 relative inline-block">
          Available Assessments
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={headerInView ? { width: "100%" } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </h1>
        <p className="text-slate-600">Choose an assessment to begin your AI-powered evaluation</p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {assessments.map((assessment) => (
          <motion.div key={assessment.id} variants={item}>
            <div className="theme-card">
              <div className="theme-header flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{assessment.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {assessment.description || "No description provided."}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className="ml-2 border-blue-200 text-blue-700 font-medium"
                >
                  {assessment.assessmentType}
                </Badge>
              </div>
              
              <div className="p-5">
                <div className="flex items-center text-sm text-slate-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Available since: {formatDate(assessment.updatedAt)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(typeof assessment.questionFormat === 'string' 
                    ? JSON.parse(assessment.questionFormat) 
                    : assessment.questionFormat
                  ).map((format: string, index: number) => (
                    <motion.div
                      key={format}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge 
                        key={format} 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100"
                      >
                        {format.replace('_', '-')}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                  <span className="text-sm text-slate-600">Assessment</span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button 
                    onClick={() => router.push(`/examination/${assessment.id}`)}
                    className="theme-btn flex items-center"
                  >
                    <MonitorPlay className="h-4 w-4 mr-2" />
                    Take Assessment
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}