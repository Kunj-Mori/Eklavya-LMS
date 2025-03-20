"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, UserCheck, AlertCircle, Sparkles, Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
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

interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionType: string;
  question: string;
  options: any;
  marks: number;
  difficultyLevel: number;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AssessmentExamPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const { ref: cardRef, inView: cardInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the assessment details
        const assessmentResponse = await axios.get(`/api/assessments/published/${params.assessmentId}`);
        setAssessment(assessmentResponse.data);
        
        // Fetch the questions for this assessment
        const questionsResponse = await axios.get(`/api/assessments/published/${params.assessmentId}/questions`);
        setQuestions(questionsResponse.data);
        
        // Calculate total marks
        const total = questionsResponse.data.reduce((sum: number, q: AssessmentQuestion) => sum + q.marks, 0);
        setTotalMarks(total);
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast.error("Failed to load assessment");
        router.push("/examination");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [params.assessmentId, router]);

  const startAssessment = () => {
    router.push(`/examination/${params.assessmentId}/session`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-3.5rem)]" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-20 h-20 mb-6">
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
          <p className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Loading assessment details...
          </p>
          <p className="text-slate-500 text-sm">Preparing your AI-powered learning experience</p>
        </motion.div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-6" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button onClick={() => router.push("/examination")} className="flex items-center text-slate-700 hover:text-blue-600 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-blue-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Assessments</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="theme-card">
            <div className="theme-header bg-gradient-to-r from-red-50 to-orange-50 flex justify-center py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative"
              >
                <AlertCircle className="h-20 w-20 text-red-500" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </motion.div>
              </motion.div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold mb-3">Assessment Not Found</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                The assessment you're looking for is not available or has been unpublished.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button 
                  onClick={() => router.push("/examination")}
                  className="theme-btn flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Assessments
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" style={{background: 'hsl(var(--theme-bg))'}}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button onClick={() => router.push("/examination")} className="flex items-center text-slate-700 hover:text-blue-600 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-blue-50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Assessments</span>
        </button>
      </motion.div>
      
      <motion.div
        ref={cardRef}
        variants={fadeInUp}
        initial="hidden"
        animate={cardInView ? "visible" : "hidden"}
      >
        <div className="theme-card mb-10">
          <div className="theme-header">
            <h2 className="text-2xl font-bold text-slate-800">{assessment.title}</h2>
            <p className="text-slate-600 mt-1">{assessment.description}</p>
          </div>
          <div className="p-6">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div 
                className="relative bg-white p-5 rounded-lg border border-blue-100 shadow-sm overflow-hidden"
                whileHover={{ y: -5, boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.3)" }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <BookOpen className="h-20 w-20 text-blue-500" />
                </div>
                <div className="flex items-center relative">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-600">Format</div>
                    <div className="font-medium text-gray-800">{assessment.assessmentType}</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative bg-white p-5 rounded-lg border border-amber-100 shadow-sm overflow-hidden"
                whileHover={{ y: -5, boxShadow: "0 10px 20px -10px rgba(245, 158, 11, 0.3)" }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Clock className="h-20 w-20 text-amber-500" />
                </div>
                <div className="flex items-center relative">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-600">Questions</div>
                    <div className="font-medium text-gray-800">{questions.length} questions</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative bg-white p-5 rounded-lg border border-green-100 shadow-sm overflow-hidden"
                whileHover={{ y: -5, boxShadow: "0 10px 20px -10px rgba(16, 185, 129, 0.3)" }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Award className="h-20 w-20 text-green-500" />
                </div>
                <div className="flex items-center relative">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600">Total Marks</div>
                    <div className="font-medium text-gray-800">{totalMarks} marks</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3 className="font-semibold text-lg mb-3">Question Types:</h3>
              <div className="flex flex-wrap gap-2">
                {(typeof assessment.questionFormat === 'string' 
                  ? JSON.parse(assessment.questionFormat) 
                  : assessment.questionFormat
                ).map((format: string, index: number) => (
                  <motion.div
                    key={format}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                  >
                    <Badge 
                      variant="secondary"
                      className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100"
                    >
                      {format.replace('_', '-')}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="pt-6 border-t border-slate-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="font-semibold text-lg mb-4">Before You Begin:</h3>
              <ul className="space-y-3">
                {[
                  "Ensure you have a stable internet connection before starting the assessment.",
                  "Once started, try to complete the assessment without interruption.",
                  "Read each question carefully before answering.",
                  "Your answers are saved automatically as you progress.",
                  "You can review your answers before final submission."
                ].map((tip, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start text-sm text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                  >
                    <Sparkles className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="flex justify-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <button 
            onClick={startAssessment}
            className="ai-btn px-10 py-6 text-lg font-semibold rounded-xl ai-glow"
          >
            <Zap className="h-5 w-5 mr-3 inline-block" />
            Start Assessment
          </button>
          <motion.div 
            className="absolute -top-2 -right-2 text-yellow-500 z-10"
            animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-blue-300" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
} 