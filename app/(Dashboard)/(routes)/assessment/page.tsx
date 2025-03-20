"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen } from "lucide-react";
import { AssessmentCard } from "./_components/assessment-card";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessmentType: string;
  inclusivityMode: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useUser();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is an instructor
  const isInstructor = user?.publicMetadata?.role === "instructor";

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/assessments");
        setAssessments(response.data);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const onCreateClick = () => {
    router.push("/assessment/create");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">AI-Powered Assessments</h1>
        {isInstructor && (
          <Button onClick={onCreateClick}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Assessment
          </Button>
        )}
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {isInstructor 
            ? "Create and manage comprehensive assessments for candidates including pen-paper, online MCQs, descriptive exams, practical assessments, and viva voce. Our AI-powered system supports inclusive evaluation for all candidates, including Persons with Disabilities (PWD)."
            : "Take comprehensive assessments including online MCQs, descriptive exams, and practical assessments. Our AI-powered system supports inclusive evaluation for all candidates."
          }
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading assessments...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-slate-100 rounded-md">
          {isInstructor ? (
            <>
              <p className="text-sm text-gray-500 mb-2">No assessments found</p>
              <Button variant="outline" onClick={onCreateClick}>
                Create your first assessment
              </Button>
            </>
          ) : (
            <div className="text-center p-4">
              <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No assessments are available right now</p>
              <p className="text-xs text-gray-400 mt-1">Check back later for new assessments</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              id={assessment.id}
              title={assessment.title}
              description={assessment.description || ""}
              assessmentType={assessment.assessmentType}
              inclusivityMode={assessment.inclusivityMode}
              isPublished={assessment.isPublished}
            />
          ))}
        </div>
      )}
    </div>
  );
} 