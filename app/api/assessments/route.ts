import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user to check if they are viewing their created assessments (instructor)
    // or published assessments (student)
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    let assessments;
    
    if (isInstructor) {
      // Instructors see all their created assessments
      assessments = await prisma.assessment.findMany({
        where: {
          createdById: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Students only see published assessments
      assessments = await prisma.assessment.findMany({
        where: {
          isPublished: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(assessments);
  } catch (error) {
    console.log("[ASSESSMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request
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
      return new NextResponse("Access denied. Only instructors can create assessments.", { status: 403 });
    }

    const { title, description, assessmentType, questionFormat, inclusivityMode, courseId } = await req.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        assessmentType,
        questionFormat: Array.isArray(questionFormat) ? JSON.stringify(questionFormat) : questionFormat,
        inclusivityMode: inclusivityMode || false,
        createdById: userId,
        courseId,
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.log("[ASSESSMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 