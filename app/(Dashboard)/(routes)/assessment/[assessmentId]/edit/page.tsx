"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().optional(),
  assessmentType: z.enum(["ONLINE", "OFFLINE", "BLENDED"]),
  questionFormats: z.array(
    z.enum(["MCQ", "DESCRIPTIVE", "PRACTICAL", "VIVA", "PEN_PAPER"])
  ).min(1, { message: "Select at least one question format" }),
  inclusivityMode: z.boolean().default(false),
});

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessmentType: string;
  questionFormat: string | string[];
  inclusivityMode: boolean;
  isPublished: boolean;
}

const EditAssessmentPage = ({ params }: { params: { assessmentId: string }}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [initialFormats, setInitialFormats] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assessmentType: "ONLINE",
      questionFormats: ["MCQ"],
      inclusivityMode: false,
    },
  });

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/assessments/${params.assessmentId}`);
        const assessmentData = response.data;
        setAssessment(assessmentData);
        
        // Parse question formats
        let formats = [];
        if (typeof assessmentData.questionFormat === 'string') {
          try {
            formats = JSON.parse(assessmentData.questionFormat);
          } catch (e) {
            formats = [assessmentData.questionFormat];
          }
        } else {
          formats = assessmentData.questionFormat;
        }
        
        setInitialFormats(formats);
        
        // Set form values
        form.reset({
          title: assessmentData.title,
          description: assessmentData.description || "",
          assessmentType: assessmentData.assessmentType,
          questionFormats: formats,
          inclusivityMode: assessmentData.inclusivityMode,
        });
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment");
        router.push("/assessment");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [params.assessmentId, router, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/assessments/${params.assessmentId}`, {
        title: values.title,
        description: values.description,
        assessmentType: values.assessmentType,
        questionFormat: values.questionFormats,
        inclusivityMode: values.inclusivityMode,
      });
      
      toast.success("Assessment updated successfully");
      router.push(`/assessment/${params.assessmentId}`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !assessment) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            onClick={() => router.push(`/assessment/${params.assessmentId}`)} 
            variant="ghost" 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Assessment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Title</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading} 
                      placeholder="e.g. 'Web Development Skills Assessment'" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      disabled={isLoading} 
                      placeholder="Describe the purpose and content of this assessment" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what skills or knowledge this assessment will evaluate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Mode</FormLabel>
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                      <SelectItem value="BLENDED">Blended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how candidates will take this assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionFormats"
              render={() => (
                <FormItem>
                  <FormLabel>Question Formats</FormLabel>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("MCQ")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "MCQ"]
                                  : field.value.filter((value) => value !== "MCQ");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Multiple Choice Questions</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("DESCRIPTIVE")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "DESCRIPTIVE"]
                                  : field.value.filter((value) => value !== "DESCRIPTIVE");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Descriptive Questions</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("PRACTICAL")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "PRACTICAL"]
                                  : field.value.filter((value) => value !== "PRACTICAL");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Practical Exam</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("VIVA")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "VIVA"]
                                  : field.value.filter((value) => value !== "VIVA");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Viva Voice</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("PEN_PAPER")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "PEN_PAPER"]
                                  : field.value.filter((value) => value !== "PEN_PAPER");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pen & Paper</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inclusivityMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable Inclusivity Mode
                    </FormLabel>
                    <FormDescription>
                      Provides accessibility features for Persons with Disabilities (PwD).
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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
};

export default EditAssessmentPage; 