"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const AssessmentCompletedPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Assessment Completed</CardTitle>
          <CardDescription>
            Thank you for completing the assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            Your responses have been recorded successfully. 
          </p>
          <p>
            The instructor will review your answers and provide feedback if necessary.
          </p>
          <p className="text-sm text-slate-500">
            Results will be available once the instructor has reviewed your submission.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push("/examination")}
            className="w-full"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Return to Assessments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentCompletedPage; 