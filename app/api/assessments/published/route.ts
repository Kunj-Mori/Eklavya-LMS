import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    // Fetch all published assessments
    const publishedAssessments = await prisma.assessment.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(publishedAssessments);
  } catch (error) {
    console.log("[PUBLISHED_ASSESSMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 