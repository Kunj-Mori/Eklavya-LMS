import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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

    // Check if viewing published assessment or own assessment
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    let assessment;
    
    if (isInstructor) {
      // Instructors can view their own assessments
      assessment = await prisma.assessment.findUnique({
        where: {
          id: params.assessmentId,
          createdById: userId,
        },
      });
    } else {
      // Students can only view published assessments
      assessment = await prisma.assessment.findUnique({
        where: {
          id: params.assessmentId,
          isPublished: true,
        },
      });
    }

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.log("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can modify assessments.", { status: 403 });
    }
    
    const { title, description, assessmentType, questionFormat, inclusivityMode, isPublished } = await req.json();

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    const updatedAssessment = await prisma.assessment.update({
      where: {
        id: params.assessmentId,
      },
      data: {
        title: title !== undefined ? title : assessment.title,
        description: description !== undefined ? description : assessment.description,
        assessmentType: assessmentType !== undefined ? assessmentType : assessment.assessmentType,
        questionFormat: questionFormat !== undefined ? 
          (Array.isArray(questionFormat) ? JSON.stringify(questionFormat) : questionFormat) : 
          assessment.questionFormat,
        inclusivityMode: inclusivityMode !== undefined ? inclusivityMode : assessment.inclusivityMode,
        isPublished: isPublished !== undefined ? isPublished : assessment.isPublished,
      },
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.log("[ASSESSMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can delete assessments.", { status: 403 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // First delete all questions, sessions, and responses
    await prisma.assessmentQuestion.deleteMany({
      where: {
        assessmentId: params.assessmentId,
      },
    });

    await prisma.assessmentSession.deleteMany({
      where: {
        assessmentId: params.assessmentId,
      },
    });

    // Then delete the assessment
    await prisma.assessment.delete({
      where: {
        id: params.assessmentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[ASSESSMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 