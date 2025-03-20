"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { ArrowLeft, Plus, Search, Filter, Monitor, PenTool, Mic, Globe, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionCard from "./_components/question-card";

interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionType: string;
  question: string;
  options: any;
  correctAnswer: string | null;
  marks: number;
  difficultyLevel: number;
  accessibilityOptions: any;
  createdAt: string;
  updatedAt: string;
}

interface Assessment {
  id: string;
  title: string;
  questionFormat: string[] | string;
}

interface PageProps {
  params: {
    assessmentId: string;
  };
}

const questionTypeIcons = {
  "MCQ": <Monitor className="h-4 w-4" />,
  "DESCRIPTIVE": <FileText className="h-4 w-4" />,
  "PRACTICAL": <Globe className="h-4 w-4" />,
  "VIVA": <Mic className="h-4 w-4" />,
  "PEN_PAPER": <PenTool className="h-4 w-4" />
};

export default function QuestionsPage({ params }: PageProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentAndQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assessment data
        const assessmentResponse = await axios.get(`/api/assessments/${params.assessmentId}`);
        setAssessment(assessmentResponse.data);
        
        // Fetch questions for this assessment
        const questionsResponse = await axios.get(`/api/assessments/${params.assessmentId}/questions`);
        setQuestions(questionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentAndQuestions();
  }, [params.assessmentId]);

  const createNewQuestion = (type: string) => {
    router.push(`/assessment/${params.assessmentId}/questions/new?type=${type}`);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? question.questionType === filterType : true;
    return matchesSearch && matchesType;
  });

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await axios.delete(`/api/assessments/${params.assessmentId}/questions/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Question deleted successfully");
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => router.push(`/assessment/${params.assessmentId}`)} 
          variant="ghost" 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Questions</h1>
        <p className="ml-2 text-sm text-gray-500">
          {assessment?.title}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterType || "ALL"}
            onValueChange={(value) => setFilterType(value === "ALL" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {(typeof assessment?.questionFormat === 'string' 
                ? JSON.parse(assessment.questionFormat) 
                : assessment?.questionFormat
              )?.map((format: string) => (
                <SelectItem key={format} value={format}>
                  <div className="flex items-center">
                    {questionTypeIcons[format as keyof typeof questionTypeIcons]}
                    <span className="ml-2">{format.replace('_', ' ')}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Questions</TabsTrigger>
          {(typeof assessment?.questionFormat === 'string' 
            ? JSON.parse(assessment.questionFormat) 
            : assessment?.questionFormat
          )?.map((format: string) => (
            <TabsTrigger key={format} value={format}>
              <div className="flex items-center">
                {questionTypeIcons[format as keyof typeof questionTypeIcons]}
                <span className="ml-2">{format.replace('_', '-')}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
              <h3 className="font-semibold mb-2">Add New Question</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {(typeof assessment?.questionFormat === 'string' 
                  ? JSON.parse(assessment.questionFormat) 
                  : assessment?.questionFormat
                )?.map((format: string) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    onClick={() => createNewQuestion(format)}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {questionTypeIcons[format as keyof typeof questionTypeIcons]}
                    <span className="ml-1">{format.replace('_', '-')}</span>
                  </Button>
                ))}
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-gray-500 mb-2">No questions found</p>
                  <Button variant="outline" onClick={() => createNewQuestion(assessment?.questionFormat[0] || 'MCQ')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onEdit={() => router.push(`/assessment/${params.assessmentId}/questions/${question.id}`)}
                />
              ))
            )}
          </div>
        </TabsContent>

        {(typeof assessment?.questionFormat === 'string' 
          ? JSON.parse(assessment.questionFormat) 
          : assessment?.questionFormat
        )?.map((format: string) => (
          <TabsContent key={format} value={format}>
            <div className="grid grid-cols-1 gap-4">
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <h3 className="font-semibold mb-2">Add New {format.replace('_', '-')} Question</h3>
                <Button
                  variant="outline"
                  onClick={() => createNewQuestion(format)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {questionTypeIcons[format as keyof typeof questionTypeIcons]}
                  <span className="ml-1">Add {format.replace('_', '-')}</span>
                </Button>
              </div>

              {filteredQuestions.filter(q => q.questionType === format).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-gray-500 mb-2">No {format.replace('_', '-')} questions found</p>
                    <Button variant="outline" onClick={() => createNewQuestion(format)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first {format.replace('_', '-')} question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions
                  .filter(q => q.questionType === format)
                  .map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onDelete={() => handleDeleteQuestion(question.id)}
                      onEdit={() => router.push(`/assessment/${params.assessmentId}/questions/${question.id}`)}
                    />
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 