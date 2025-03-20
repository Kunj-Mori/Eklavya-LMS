"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ResponseDetails {
  id: string;
  userId: string;
  status: string;
  startTime: Date;
  endTime: Date;
  score: number;
  createdAt: Date;
  responses: {
    id: string;
    questionId: string;
    answer: string;
    isCorrect: boolean | null;
    score: number | null;
    question: {
      id: string;
      text: string;
      type: string;
      options: string[];
      correctAnswer: string;
      marks: number;
    };
  }[];
}

const ResponseDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [responseDetails, setResponseDetails] = useState<ResponseDetails | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const fetchResponseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/assessments/${params.assessmentId}/responses/${params.responseId}`
        );
        setResponseDetails(response.data);
      } catch (error) {
        toast.error("Failed to load response details");
      } finally {
        setLoading(false);
      }
    };

    fetchResponseDetails();
  }, [params.assessmentId, params.responseId]);

  const handleBack = () => {
    router.push(`/assessment/${params.assessmentId}`);
  };

  const evaluateResponse = async (responseId: string, isCorrect: boolean, score: number) => {
    try {
      setEvaluating(true);
      await axios.patch(`/api/assessments/${params.assessmentId}/responses/${params.responseId}`, {
        responseId,
        isCorrect,
        score,
      });
      
      toast.success("Response evaluated successfully");
      
      // Refresh the data
      const response = await axios.get(
        `/api/assessments/${params.assessmentId}/responses/${params.responseId}`
      );
      setResponseDetails(response.data);
    } catch (error) {
      toast.error("Failed to evaluate response");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-1/3 mb-4 bg-slate-200 animate-pulse rounded-md"></div>
        <div className="h-[60vh] w-full bg-slate-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (!responseDetails) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Response not found</h1>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Response Details</h1>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{responseDetails.userId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Submission Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(responseDetails.endTime)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge className={responseDetails.score >= 70 ? "bg-green-500" : "bg-red-500"}>
                {responseDetails.score}%
              </Badge>
              <Badge className="ml-2">{responseDetails.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Responses</h2>

      {responseDetails.responses.map((response, index) => (
        <Card key={response.id} className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Question {index + 1}</span>
              <span>({response.question.marks} marks)</span>
            </CardTitle>
            <p className="text-md mt-2">{response.question.text}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Student Response:</h3>
              {response.question.type === "MCQ" ? (
                <RadioGroup defaultValue={response.answer} disabled>
                  {response.question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${response.id}-${i}`}
                        checked={option === response.answer}
                      />
                      <Label htmlFor={`option-${response.id}-${i}`}>
                        {option} {option === response.question.correctAnswer && "(Correct Answer)"}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="border p-3 rounded-md">
                  {response.answer || <span className="text-gray-400">No response provided</span>}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="font-medium mb-2">Evaluation:</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant={response.isCorrect === true ? "default" : "outline"}
                  size="sm"
                  className="flex items-center"
                  onClick={() => evaluateResponse(response.id, true, response.question.marks)}
                  disabled={evaluating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Correct
                </Button>
                <Button
                  variant={response.isCorrect === false ? "destructive" : "outline"}
                  size="sm"
                  className="flex items-center"
                  onClick={() => evaluateResponse(response.id, false, 0)}
                  disabled={evaluating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Incorrect
                </Button>
                
                {response.question.type !== "MCQ" && (
                  <div className="flex items-center ml-4">
                    <Label htmlFor={`score-${response.id}`} className="mr-2">Partial Score:</Label>
                    <Input
                      id={`score-${response.id}`}
                      type="number"
                      min="0"
                      max={response.question.marks}
                      value={response.score || 0}
                      className="w-20"
                      onChange={(e) => {
                        const score = parseInt(e.target.value);
                        if (!isNaN(score) && score >= 0 && score <= response.question.marks) {
                          evaluateResponse(response.id, score > 0, score);
                        }
                      }}
                    />
                    <span className="ml-2">/ {response.question.marks}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponseDetailsPage; 