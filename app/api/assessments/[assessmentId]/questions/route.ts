import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Get questions for this assessment
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        assessmentId: params.assessmentId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.log("[ASSESSMENT_QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    const { questionType, question, options, correctAnswer, marks, difficultyLevel, accessibilityOptions } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    if (!question) {
      return new NextResponse("Question is required", { status: 400 });
    }

    if (!questionType) {
      return new NextResponse("Question type is required", { status: 400 });
    }

    // Create the question
    const newQuestion = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: params.assessmentId,
        questionType,
        question,
        options: options || undefined,
        correctAnswer: correctAnswer || undefined,
        marks: marks || 1,
        difficultyLevel: difficultyLevel || 1,
        accessibilityOptions: accessibilityOptions || undefined,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.log("[ASSESSMENT_QUESTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 