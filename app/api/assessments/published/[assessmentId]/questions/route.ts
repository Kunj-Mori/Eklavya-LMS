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

    // Check if the assessment exists and is published
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        isPublished: true,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not published", { status: 404 });
    }

    // Get questions for this assessment
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        assessmentId: params.assessmentId,
      },
      select: {
        id: true,
        assessmentId: true,
        questionType: true,
        question: true,
        options: true,
        marks: true,
        difficultyLevel: true,
        accessibilityOptions: true,
        createdAt: true,
        updatedAt: true,
        // Exclude correctAnswer for students
        correctAnswer: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.log("[PUBLISHED_ASSESSMENT_QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 