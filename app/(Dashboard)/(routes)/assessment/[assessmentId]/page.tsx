"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  BookOpen, 
  Play, 
  Edit, 
  Trash2,
  AccessibilityIcon,
  Globe,
  FileText,
  Mic,
  Monitor,
  PenTool
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessmentType: string;
  questionFormat: string[] | string;
  inclusivityMode: boolean;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: {
    assessmentId: string;
  };
}

const questionIcons = {
  "MCQ": <Monitor className="h-4 w-4 mr-1" />,
  "DESCRIPTIVE": <FileText className="h-4 w-4 mr-1" />,
  "PRACTICAL": <Globe className="h-4 w-4 mr-1" />,
  "VIVA": <Mic className="h-4 w-4 mr-1" />,
  "PEN_PAPER": <PenTool className="h-4 w-4 mr-1" />
};

export default function AssessmentDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState("overview");
  const [responses, setResponses] = useState([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/assessments/${params.assessmentId}`);
        setAssessment(response.data);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment details");
        router.push("/assessment");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [params.assessmentId, router]);

  useEffect(() => {
    if (tabValue === "results") {
      fetchResponses();
    }
    
    if (tabValue === "preview" || tabValue === "questions") {
      fetchQuestions();
    }
  }, [tabValue, params.assessmentId]);

  const fetchResponses = async () => {
    try {
      setIsLoadingResponses(true);
      const response = await axios.get(`/api/assessments/${params.assessmentId}/responses`);
      setResponses(response.data);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast.error("Failed to load assessment responses");
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await axios.get(`/api/assessments/${params.assessmentId}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load assessment questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handlePublish = async () => {
    try {
      await axios.patch(`/api/assessments/${params.assessmentId}`, {
        isPublished: !assessment?.isPublished,
      });
      
      setAssessment((prev) => 
        prev ? { ...prev, isPublished: !prev.isPublished } : null
      );
      
      toast.success(
        assessment?.isPublished 
          ? "Assessment unpublished successfully" 
          : "Assessment published successfully"
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      await axios.delete(`/api/assessments/${params.assessmentId}`);
      toast.success("Assessment deleted successfully");
      router.push("/assessment");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading assessment details...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-6">
        <p>Assessment not found</p>
        <Button onClick={() => router.push("/assessment")} variant="outline" className="mt-4">
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => router.push("/assessment")} 
          variant="ghost" 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/assessment/${assessment.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant={assessment.isPublished ? "destructive" : "default"} 
            onClick={handlePublish}
          >
            {assessment.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Badge 
          variant="outline" 
          className={
            assessment.assessmentType === "ONLINE" 
              ? "bg-green-100 text-green-800" 
              : assessment.assessmentType === "OFFLINE" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-purple-100 text-purple-800"
          }
        >
          {assessment.assessmentType.toLowerCase()}
        </Badge>
        
        {assessment.inclusivityMode && (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2">
            <AccessibilityIcon className="h-3 w-3 mr-1" />
            PWD Support
          </Badge>
        )}
        
        {assessment.isPublished ? (
          <Badge className="bg-green-700 ml-2">Published</Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500 border-slate-500 ml-2">
            Draft
          </Badge>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        {assessment.description || "No description provided."}
      </p>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Question Formats:</h3>
        <div className="flex flex-wrap gap-2">
          {(typeof assessment.questionFormat === 'string' 
            ? JSON.parse(assessment.questionFormat) 
            : assessment.questionFormat
          ).map((format: string) => (
            <Badge key={format} variant="outline" className="flex items-center bg-gray-100">
              {questionIcons[format as keyof typeof questionIcons]}
              {format.replace('_', '-')}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="overview" value={tabValue} onValueChange={setTabValue}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
                <CardDescription>Manage your assessment questions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/assessment/${assessment.id}/questions`)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Candidates</CardTitle>
                <CardDescription>Manage and invite candidates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/assessment/${assessment.id}/candidates`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Candidates
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview Assessment</CardTitle>
                <CardDescription>Experience the assessment as a candidate</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/examination/${assessment.id}/preview`)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAssessment}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="questions">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Assessment Questions</h2>
              <Button onClick={() => router.push(`/assessment/${assessment.id}/questions`)}>
                Manage Questions
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Question Bank</CardTitle>
                <CardDescription>
                  Create and manage questions for this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="font-medium">Question Formats</div>
                    <div className="flex gap-2">
                      {(typeof assessment.questionFormat === 'string' 
                        ? JSON.parse(assessment.questionFormat) 
                        : assessment.questionFormat
                      ).map((format: string) => (
                        <Badge key={format} variant="outline" className="flex items-center bg-gray-100">
                          {questionIcons[format as keyof typeof questionIcons]}
                          {format.replace('_', '-')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => router.push(`/assessment/${assessment.id}/questions`)}
                  >
                    Go to Question Editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          {isLoadingQuestions ? (
            <div className="p-8 flex justify-center">
              <p>Loading preview...</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Preview</CardTitle>
                <CardDescription>
                  View how this assessment will appear to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
                    <p className="text-gray-600 mb-4">{assessment.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-500">Format</div>
                          <div className="font-medium">{assessment.assessmentType}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-amber-600" />
                        <div>
                          <div className="text-sm text-gray-500">Accessibility</div>
                          <div className="font-medium">
                            {assessment.inclusivityMode ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        onClick={() => window.open(`/examination/${assessment.id}`, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Full Preview
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Question Preview</h3>
                    
                    {/* Preview of first 2 questions */}
                    {Array.isArray(questions) && questions.slice(0, 2).map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-md">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Badge variant="outline">
                            {question.questionType === "MCQ" 
                              ? "Multiple Choice"
                              : question.questionType === "DESCRIPTIVE"
                              ? "Descriptive" 
                              : question.questionType
                            }
                          </Badge>
                        </div>
                        <p className="mb-4">{question.question}</p>
                        
                        {question.questionType === "MCQ" && Array.isArray(question.options) && (
                          <div className="space-y-2 ml-4">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {Array.isArray(questions) && questions.length > 2 && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        + {questions.length - 2} more questions
                      </div>
                    )}
                    
                    {(!Array.isArray(questions) || questions.length === 0) && (
                      <div className="text-center p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-500">No questions added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Results & Analytics</h2>
              <Button variant="outline">
                Export Results
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Participation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{responses.length}</div>
                  <p className="text-sm text-slate-500">candidates attempted</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {responses.length > 0 
                      ? `${Math.round(responses.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / responses.length)}%` 
                      : 'N/A'}
                  </div>
                  <p className="text-sm text-slate-500">out of 100%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {responses.filter((r: any) => r.status === "COMPLETED").length} / {responses.length}
                  </div>
                  <p className="text-sm text-slate-500">completed / enrolled</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>
                  View and analyze candidate performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Responses</h3>
                  {responses.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-md">
                      <p className="text-gray-500">No responses recorded yet</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((response) => (
                            <TableRow key={response.id}>
                              <TableCell>{response.userId}</TableCell>
                              <TableCell>
                                <Badge>
                                  {response.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(response.endTime || response.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {response.score !== null ? (
                                  <Badge className={response.score >= 70 ? "bg-green-500" : "bg-red-500"}>
                                    {response.score}%
                                  </Badge>
                                ) : (
                                  "Not graded"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(`/assessment/${params.assessmentId}/responses/${response.id}`)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 