"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Save, 
  CheckCircle, 
  Volume2, 
  Mic, 
  StopCircle,
  AccessibilityIcon,
  Brain,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface Assessment {
  id: string;
  title: string;
  inclusivityMode: boolean;
}

interface Question {
  id: string;
  questionType: string;
  question: string;
  options: string[];
  marks: number;
}

interface Answer {
  questionId: string;
  answer: string;
}

export default function AssessmentSessionPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  
  // Accessibility features
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const speechRecognitionRef = useRef<any>(null);
  
  // For GSAP animations
  const questionCardRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the assessment details
        const assessmentResponse = await axios.get(`/api/assessments/published/${params.assessmentId}`);
        setAssessment(assessmentResponse.data);
        
        // Fetch the questions for this assessment
        const questionsResponse = await axios.get(`/api/assessments/published/${params.assessmentId}/questions`);
        setQuestions(questionsResponse.data);
        
        // Initialize answers array
        const initialAnswers = questionsResponse.data.map((q: Question) => ({
          questionId: q.id,
          answer: ""
        }));
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        toast.error("Failed to load assessment");
        router.push(`/examination/${params.assessmentId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
    
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          const updatedAnswers = [...answers];
          updatedAnswers[currentQuestionIndex].answer = transcript;
          setAnswers(updatedAnswers);
        }
      };
      
      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error('Error with speech recognition. Please try again.');
        setIsListening(false);
      };
    }
    
    // Cleanup function
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, [params.assessmentId, router]);

  // Animation for question transition
  useEffect(() => {
    if (!isLoading && questionCardRef.current) {
      gsap.fromTo(
        questionCardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      
      if (optionsRef.current) {
        gsap.fromTo(
          optionsRef.current.children,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
      }
    }
  }, [currentQuestionIndex, isLoading]);

  const handleAnswerChange = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].answer = answer;
    setAnswers(updatedAnswers);
  };

  const navigateToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setActiveAnimation('slideRight');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setActiveAnimation(null);
      }, 300);
    }
  };

  const navigateToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setActiveAnimation('slideLeft');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setActiveAnimation(null);
      }, 300);
    }
  };

  const saveProgress = async () => {
    try {
      setIsSaving(true);
      setActiveAnimation('save');
      
      // Here you would normally save the answers to the backend
      // For demo purposes, we'll just show a toast
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Progress saved");
    } catch (error) {
      toast.error("Failed to save progress");
    } finally {
      setIsSaving(false);
      setActiveAnimation(null);
    }
  };

  const submitAssessment = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if all questions have been answered
      const unansweredCount = answers.filter(a => !a.answer.trim()).length;
      if (unansweredCount > 0) {
        const proceed = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
        );
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit answers to the backend
      const response = await axios.post(`/api/assessments/${params.assessmentId}/responses`, {
        answers: answers
      });
      
      toast.success("Assessment submitted successfully");
      router.push(`/examination/${params.assessmentId}/completed`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
      setIsSubmitting(false);
    }
  };
  
  // Text-to-Speech function
  const speakText = () => {
    if (!speechSynthesis) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }
    
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    let textToSpeak = currentQuestion.question;
    
    if (currentQuestion.questionType === "MCQ" && currentQuestion.options) {
      textToSpeak += ". Options: ";
      currentQuestion.options.forEach((option, index) => {
        textToSpeak += `Option ${index + 1}: ${option}. `;
      });
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  
  // Speech-to-Text function
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
      toast.success("Listening... Speak now");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
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
          <motion.p 
            className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading assessment...
          </motion.p>
          <p className="text-gray-500 text-sm">Preparing your AI examination experience</p>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="overflow-hidden shadow-lg border-amber-100">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AlertCircle className="h-16 w-16 text-amber-500" />
              </motion.div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-center mb-4">No Questions Available</h2>
              <p className="text-gray-600 text-center mb-6">
                This assessment doesn't have any questions yet. Please contact your instructor.
              </p>
              <div className="flex justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => router.push(`/examination/${params.assessmentId}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-md font-medium hover:shadow-lg transition-all"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assessment
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex]?.answer || "";
  const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const renderQuestionContent = () => {
    const slideVariants = {
      hidden: { 
        x: activeAnimation === 'slideLeft' ? -50 : (activeAnimation === 'slideRight' ? 50 : 0),
        opacity: 0 
      },
      visible: { 
        x: 0,
        opacity: 1,
        transition: { duration: 0.5 } 
      },
      exit: { 
        x: activeAnimation === 'slideLeft' ? 50 : (activeAnimation === 'slideRight' ? -50 : 0),
        opacity: 0,
        transition: { duration: 0.3 } 
      }
    };

    if (currentQuestion.questionType === "MCQ") {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-6"
            ref={optionsRef}
          >
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-2 bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-all hover:shadow-md cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`} 
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`option-${index}`}
                      className="font-medium text-gray-700 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                </motion.div>
              ))}
            </RadioGroup>
          </motion.div>
        </AnimatePresence>
      );
    } else {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-6"
          >
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px] focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <div className="flex justify-between mt-4">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:shadow-md transition-all`}
                >
                  {isListening ? (
                    <StopCircle className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </motion.button>
                <span className="text-sm text-gray-500">
                  {isListening ? 'Listening...' : 'Voice input'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {currentAnswer.length > 0 ? `${currentAnswer.length} characters` : 'No input yet'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Progress bar */}
      <motion.div 
        className="w-full bg-gray-100 rounded-full h-2 mb-6"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${questionProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      
      {/* Question card */}
      <motion.div
        ref={questionCardRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-1">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Brain className="h-5 w-5 text-purple-500" />
                  </motion.div>
                  <span className="text-sm font-medium text-purple-700">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl">
                  {currentQuestion.question}
                </CardTitle>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={speakText}
                  className={`p-2 rounded-full ${isSpeaking ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} hover:shadow-md transition-all`}
                >
                  <Volume2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Clock className="h-4 w-4 text-amber-600 mr-1" />
              <span className="text-amber-700 font-medium">{currentQuestion.marks} marks</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-500">
                {currentQuestion.questionType === "MCQ" ? "Multiple Choice" : "Written Answer"}
              </span>
            </div>
          </CardHeader>
          
          {renderQuestionContent()}
          
          <CardFooter className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={navigateToPrevious}
                  disabled={currentQuestionIndex === 0}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                animate={activeAnimation === 'save' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={saveProgress}
                  disabled={isSaving}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-all"
                >
                  {isSaving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="h-4 w-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Progress
                </Button>
              </motion.div>
            </div>
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={navigateToNext}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitAssessment}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles className="h-4 w-4 mr-2" />
                      </motion.div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Submit Assessment
                  </Button>
                )}
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Navigation dots */}
      <motion.div 
        className="flex justify-center mt-8 flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {questions.map((_, index) => (
          <motion.button
            key={index}
            className={`w-4 h-4 rounded-full ${
              index === currentQuestionIndex
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : answers[index]?.answer
                ? 'bg-green-500'
                : 'bg-gray-200'
            } hover:opacity-80 transition-all`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentQuestionIndex(index)}
          />
        ))}
      </motion.div>
    </div>
  );
} 