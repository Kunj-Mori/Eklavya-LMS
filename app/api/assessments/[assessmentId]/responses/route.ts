import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
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

    const { answers } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return new NextResponse("Invalid answers data", { status: 400 });
    }

    // Create a new assessment session
    const session = await prisma.assessmentSession.create({
      data: {
        assessmentId: params.assessmentId,
        userId: userId,
        status: "COMPLETED",
      },
    });

    // Save all responses
    const responses = await Promise.all(
      answers.map(async (answer: any) => {
        return prisma.assessmentResponse.create({
          data: {
            sessionId: session.id,
            questionId: answer.questionId,
            answer: answer.answer,
          },
        });
      })
    );

    // Calculate score if we want to (for future implementation)
    // This would compare answers against correctAnswer

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      responseCount: responses.length
    });
  } catch (error) {
    console.log("[ASSESSMENT_RESPONSE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get all responses for a specific assessment (for instructors)
export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify that the requester is the creator of the assessment
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not authorized", { status: 404 });
    }

    // Get all sessions for this assessment
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        assessmentId: params.assessmentId,
      },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.log("[ASSESSMENT_RESPONSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 