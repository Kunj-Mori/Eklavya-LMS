"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
  questionType: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  marks: z.coerce.number().min(1, { message: "Marks must be at least 1" }),
  difficultyLevel: z.coerce.number().min(1).max(5),
  accessibilityOptions: z.object({
    enabled: z.boolean().default(false),
    audioDescription: z.string().optional(),
    textToSpeech: z.boolean().default(false),
    highContrastMode: z.boolean().default(false),
    extraTime: z.boolean().default(false),
  }).optional(),
});

interface QuestionEditProps {
  params: {
    assessmentId: string;
    questionId: string;
  };
}

export default function QuestionEditPage({ params }: QuestionEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      questionType: "MCQ",
      options: [],
      correctAnswer: "",
      marks: 1,
      difficultyLevel: 3,
      accessibilityOptions: {
        enabled: false,
        audioDescription: "",
        textToSpeech: false,
        highContrastMode: false,
        extraTime: false,
      },
    },
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/assessments/${params.assessmentId}/questions/${params.questionId}`);
        const questionData = response.data;
        
        // Parse options if they exist and are stored as a string
        let options: string[] = [];
        if (questionData.options) {
          if (typeof questionData.options === 'string') {
            try {
              options = JSON.parse(questionData.options);
            } catch (e) {
              console.error("Error parsing options:", e);
            }
          } else {
            options = questionData.options;
          }
        }
        
        setOptionsList(options);
        
        // Parse accessibility options
        let accessibilityOpts = questionData.accessibilityOptions;
        if (typeof accessibilityOpts === 'string') {
          try {
            accessibilityOpts = JSON.parse(accessibilityOpts);
          } catch (e) {
            accessibilityOpts = { enabled: false };
          }
        }
        
        setAccessibility(accessibilityOpts?.enabled || false);
        
        // Set form values
        form.reset({
          question: questionData.question,
          questionType: questionData.questionType,
          options: options,
          correctAnswer: questionData.correctAnswer || options[0] || "",
          marks: questionData.marks,
          difficultyLevel: questionData.difficultyLevel,
          accessibilityOptions: {
            enabled: accessibilityOpts?.enabled || false,
            audioDescription: accessibilityOpts?.audioDescription || "",
            textToSpeech: accessibilityOpts?.textToSpeech || false,
            highContrastMode: accessibilityOpts?.highContrastMode || false,
            extraTime: accessibilityOpts?.extraTime || false,
          },
        });
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error("Failed to load question");
        router.push(`/assessment/${params.assessmentId}/questions`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [params.assessmentId, params.questionId, router, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Prepare data for submission
      const data = {
        ...values,
        options: values.questionType === "MCQ" ? optionsList : null,
      };
      
      await axios.patch(`/api/assessments/${params.assessmentId}/questions/${params.questionId}`, data);
      
      toast.success("Question updated successfully");
      router.push(`/assessment/${params.assessmentId}/questions`);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = () => {
    setOptionsList([...optionsList, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...optionsList];
    newOptions[index] = value;
    setOptionsList(newOptions);
    form.setValue("options", newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = optionsList.filter((_, i) => i !== index);
    setOptionsList(newOptions);
    form.setValue("options", newOptions);
    
    // If correct answer was the removed option, reset it
    const correctAnswer = form.getValues("correctAnswer");
    if (correctAnswer === optionsList[index]) {
      form.setValue("correctAnswer", newOptions[0] || "");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading question...</p>
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
        <h1 className="text-2xl font-bold">Edit Question</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        disabled={true} // Cannot change question type when editing
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MCQ">Multiple Choice</SelectItem>
                          <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                          <SelectItem value="PRACTICAL">Practical</SelectItem>
                          <SelectItem value="VIVA">Viva</SelectItem>
                          <SelectItem value="PEN_PAPER">Pen & Paper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your question here..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {form.watch("questionType") === "MCQ" && (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Options</h3>
                    <div className="space-y-3">
                      {optionsList.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="mt-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            {optionsList.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <FormLabel htmlFor={`option-${index}`} className="font-normal">
                                  {option || `Option ${index + 1}`}
                                </FormLabel>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {form.watch("questionType") !== "MCQ" && (
              <Card>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer Key / Marking Scheme</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter marking guidelines or sample answer..."
                            className="resize-none"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide guidance on how to evaluate answers to this question.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Assign marks for this question.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Very Easy</SelectItem>
                            <SelectItem value="2">Easy</SelectItem>
                            <SelectItem value="3">Medium</SelectItem>
                            <SelectItem value="4">Hard</SelectItem>
                            <SelectItem value="5">Very Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue={accessibility ? "enabled" : "disabled"}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Accessibility Options</h3>
                    <TabsList>
                      <TabsTrigger 
                        value="disabled"
                        onClick={() => {
                          setAccessibility(false);
                          form.setValue("accessibilityOptions.enabled", false);
                        }}
                      >
                        Disabled
                      </TabsTrigger>
                      <TabsTrigger 
                        value="enabled"
                        onClick={() => {
                          setAccessibility(true);
                          form.setValue("accessibilityOptions.enabled", true);
                        }}
                      >
                        Enabled
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="disabled">
                    <p className="text-sm text-gray-500">
                      Accessibility options are currently disabled. Enable them to provide additional support for learners with disabilities.
                    </p>
                  </TabsContent>

                  <TabsContent value="enabled">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="accessibilityOptions.audioDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Alternative description for screen readers..."
                                className="resize-none"
                                rows={2}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide an alternative description for visual elements.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="accessibilityOptions.textToSpeech"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Text to Speech</FormLabel>
                                <FormDescription>
                                  Enable text-to-speech for this question.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accessibilityOptions.highContrastMode"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>High Contrast Mode</FormLabel>
                                <FormDescription>
                                  Enhance visibility with high contrast display.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accessibilityOptions.extraTime"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Extra Time</FormLabel>
                                <FormDescription>
                                  Allow additional time for answering.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 