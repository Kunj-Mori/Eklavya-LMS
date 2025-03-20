"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Monitor, FileText, Globe, Mic, PenTool, Star } from "lucide-react";
import { AccessibilityIcon } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    questionType: string;
    question: string;
    options?: any;
    correctAnswer?: string | null;
    marks: number;
    difficultyLevel: number;
    accessibilityOptions?: any;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const questionTypeIcons = {
  "MCQ": <Monitor className="h-4 w-4 mr-1" />,
  "DESCRIPTIVE": <FileText className="h-4 w-4 mr-1" />,
  "PRACTICAL": <Globe className="h-4 w-4 mr-1" />,
  "VIVA": <Mic className="h-4 w-4 mr-1" />,
  "PEN_PAPER": <PenTool className="h-4 w-4 mr-1" />
};

const difficultyLabels = [
  "Very Easy",
  "Easy",
  "Medium",
  "Hard",
  "Very Hard"
];

export default function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <Card className="overflow-hidden border border-slate-200">
      <CardHeader className="bg-slate-50 p-4 flex flex-row justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="flex items-center text-xs"
            >
              {questionTypeIcons[question.questionType as keyof typeof questionTypeIcons]}
              {question.questionType.replace('_', '-')}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-800 text-xs">
              <Star className="h-3 w-3 mr-1" />
              {difficultyLabels[question.difficultyLevel - 1]}
            </Badge>
            {question.accessibilityOptions && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 text-xs">
                <AccessibilityIcon className="h-3 w-3 mr-1" />
                PWD Options
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-md font-medium mb-2">{question.question}</div>
        
        {question.questionType === "MCQ" && question.options && (
          <div className="space-y-2 mt-4">
            {question.options.map((option: any, index: number) => (
              <div 
                key={index} 
                className={`p-2 rounded-md text-sm ${option === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
              >
                {option === question.correctAnswer && (
                  <Badge className="bg-green-600 mb-1">Correct</Badge>
                )}
                <div>{option}</div>
              </div>
            ))}
          </div>
        )}

        {question.questionType !== "MCQ" && question.correctAnswer && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm border border-gray-200">
            <div className="text-xs font-semibold mb-1 text-gray-500">Marking Scheme / Answer Key:</div>
            <div>{question.correctAnswer}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 