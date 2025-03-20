"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Settings, Users, Award, AccessibilityIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface AssessmentCardProps {
  id: string;
  title: string;
  description: string;
  assessmentType: string;
  inclusivityMode: boolean;
  isPublished: boolean;
}

const assessmentTypeColors = {
  "ONLINE": "bg-green-100 text-green-800",
  "OFFLINE": "bg-blue-100 text-blue-800",
  "BLENDED": "bg-purple-100 text-purple-800",
};

export const AssessmentCard = ({
  id,
  title,
  description,
  assessmentType,
  inclusivityMode,
  isPublished,
}: AssessmentCardProps) => {
  const router = useRouter();

  const onCardClick = () => {
    router.push(`/assessment/${id}`);
  };

  return (
    <Card className="flex flex-col overflow-hidden border border-slate-200 transition hover:shadow-md">
      <CardHeader className="cursor-pointer" onClick={onCardClick}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {title}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={assessmentTypeColors[assessmentType as keyof typeof assessmentTypeColors]}>
            {assessmentType.toLowerCase()}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-x-2">
          {isPublished ? (
            <Badge className="bg-green-700">Published</Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 border-slate-500">
              Draft
            </Badge>
          )}
          {inclusivityMode && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              <AccessibilityIcon className="h-3 w-3 mr-1" />
              PWD Support
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 cursor-pointer" onClick={onCardClick}>
        <p className="text-sm text-gray-500 line-clamp-3">
          {description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 p-2">
        <div className="flex w-full items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex gap-x-1 items-center text-slate-600 hover:text-slate-700"
              onClick={() => router.push(`/assessment/${id}/candidates`)}
            >
              <Users className="h-4 w-4" />
              <span>Candidates</span>
            </Button>
          </div>
          <div className="flex items-center gap-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex gap-x-1 items-center text-slate-600 hover:text-slate-700"
              onClick={() => router.push(`/assessment/${id}/questions`)}
            >
              <BookOpen className="h-4 w-4" />
              <span>Questions</span>
            </Button>
          </div>
          <div className="flex items-center gap-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex gap-x-1 items-center text-slate-600 hover:text-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/assessment/${id}/settings`);
              }}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}; 