import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const user = await currentUser();

        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                isPublished: true,
            },
        });

        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: params.courseId,
                },
            },
        });

        if (purchase) {
            return new NextResponse("Already Purchased", { status: 400 });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: (Number(course.price!) * 100).toString(),
            currency: "INR",
            receipt: `order_${course.id.slice(0, 32)}`,
            notes: {
                courseId: course.id,
                userId: user.id,
            },
        });
        
        
        //Save order information in DB
        await db.razorpayCustomer.create({
            data: {
                orderId: order.id,
                userId: user.id,
                courseId: course.id,
                amount: Number(course.price!),
                currency: order.currency,
                status: "unpaid",
                razorpaypaymentid: "",
            },
        });

        // Return order details to the frontend
        return NextResponse.json({ orderId: order.id, amount: order.amount });
    } catch (error) {
        console.error("COURSE_ID_CHECKOUT", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
      const { orderId, userId } = await req.json();
  
      if (!orderId || !userId) {
        return new NextResponse("Missing orderId or userId", { status: 400 });
      }
  
      // Find the order in the database
      const razorpayCustomer = await db.razorpayCustomer.findUnique({
        where: {
          orderId: orderId,
          userId: userId,
        },
      });
  
      if (!razorpayCustomer) {
        return new NextResponse("Order not found", { status: 404 });
      }
  
      // Update the status to 'paid'
      await db.razorpayCustomer.update({
        where: {
            orderId: orderId,
            userId: userId,
          },
        data: {
          status: "paid",
        },
      });
  
      return new NextResponse("Order updated to paid", { status: 200 });
    } catch (error) {
      console.error("UPDATE_ORDER_STATUS", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
