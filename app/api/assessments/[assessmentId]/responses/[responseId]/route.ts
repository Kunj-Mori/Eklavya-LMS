import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string; responseId: string } }
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

    // Get the specific assessment session with all responses
    const session = await prisma.assessmentSession.findUnique({
      where: {
        id: params.responseId,
      },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return new NextResponse("Response session not found", { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.log("[ASSESSMENT_RESPONSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string; responseId: string } }
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

    const body = await req.json();
    const { responseId, isCorrect, score } = body;

    if (!responseId) {
      return new NextResponse("Response ID is required", { status: 400 });
    }

    // Update the specific response with evaluation
    const updatedResponse = await prisma.assessmentResponse.update({
      where: {
        id: responseId,
      },
      data: {
        isCorrect,
        score,
      },
    });

    // Calculate and update the overall session score
    const allResponses = await prisma.assessmentResponse.findMany({
      where: {
        sessionId: params.responseId,
      },
      include: {
        question: true,
      },
    });

    const totalScore = allResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalPossibleScore = allResponses.reduce((sum, r) => sum + r.question.marks, 0);
    const percentageScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;

    // Update session score
    await prisma.assessmentSession.update({
      where: {
        id: params.responseId,
      },
      data: {
        score: percentageScore,
        status: "EVALUATED",
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.log("[ASSESSMENT_RESPONSE_EVALUATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 