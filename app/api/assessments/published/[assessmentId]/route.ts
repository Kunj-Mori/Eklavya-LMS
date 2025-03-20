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

    // Only fetch published assessments
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        isPublished: true,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not published", { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.log("[PUBLISHED_ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 