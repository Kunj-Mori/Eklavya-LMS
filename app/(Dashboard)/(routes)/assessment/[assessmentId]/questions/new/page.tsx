"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { toast } from "react-hot-toast";

interface Assessment {
  id: string;
  title: string;
  questionFormat: string[] | string;
  inclusivityMode: boolean;
}

export default function NewQuestionPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionType = searchParams.get("type") || "MCQ";

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [question, setQuestion] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [options, setOptions] = useState<string[]>([""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [accessibilityOptions, setAccessibilityOptions] = useState({
    textToSpeech: false,
    highContrast: false,
    largerText: false
  });

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/assessments/${params.assessmentId}`);
        setAssessment(response.data);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment");
        router.push(`/assessment/${params.assessmentId}/questions`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [params.assessmentId, router]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    
    // If the correct answer was this option, reset it
    if (correctAnswer === options[index]) {
      setCorrectAnswer("");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question) {
      toast.error("Question is required");
      return;
    }

    if (questionType === "MCQ" && options.some(opt => !opt)) {
      toast.error("All options must have a value");
      return;
    }

    if (questionType === "MCQ" && !correctAnswer) {
      toast.error("Please select a correct answer");
      return;
    }

    try {
      setIsSaving(true);
      
      const payload: any = {
        questionType,
        question,
        marks,
        difficultyLevel
      };

      if (questionType === "MCQ") {
        payload.options = options;
        payload.correctAnswer = correctAnswer;
      } else if (correctAnswer) {
        payload.correctAnswer = correctAnswer;
      }

      if (assessment?.inclusivityMode) {
        payload.accessibilityOptions = accessibilityOptions;
      }

      await axios.post(`/api/assessments/${params.assessmentId}/questions`, payload);
      
      toast.success("Question created successfully");
      router.push(`/assessment/${params.assessmentId}/questions`);
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => router.push(`/assessment/${params.assessmentId}/questions`)} 
          variant="ghost" 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Question</h1>
        <p className="ml-2 text-sm text-gray-500">
          {assessment?.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New {questionType.replace('_', '-')} Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>

              {questionType === "MCQ" && (
                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-2 mt-1">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={options.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Select 
                      value={correctAnswer}
                      onValueChange={setCorrectAnswer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option, index) => (
                          option && (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {questionType !== "MCQ" && (
                <div>
                  <Label htmlFor="markingScheme">Answer Key / Marking Scheme</Label>
                  <Textarea
                    id="markingScheme"
                    placeholder="Enter marking scheme or expected answers..."
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={difficultyLevel.toString()}
                    onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Very Easy</SelectItem>
                      <SelectItem value="2">Easy</SelectItem>
                      <SelectItem value="3">Medium</SelectItem>
                      <SelectItem value="4">Hard</SelectItem>
                      <SelectItem value="5">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {assessment?.inclusivityMode && (
                <div>
                  <Label className="mb-2 block">Accessibility Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="textToSpeech"
                        checked={accessibilityOptions.textToSpeech}
                        onChange={(e) => setAccessibilityOptions({
                          ...accessibilityOptions,
                          textToSpeech: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="textToSpeech">Text to Speech</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="highContrast"
                        checked={accessibilityOptions.highContrast}
                        onChange={(e) => setAccessibilityOptions({
                          ...accessibilityOptions,
                          highContrast: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="highContrast">High Contrast</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="largerText"
                        checked={accessibilityOptions.largerText}
                        onChange={(e) => setAccessibilityOptions({
                          ...accessibilityOptions,
                          largerText: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="largerText">Larger Text</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/assessment/${params.assessmentId}/questions`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 