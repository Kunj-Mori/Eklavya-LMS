import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature,orderId,courseId } = await req.json();
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        console.log(expectedSignature);
        console.log(razorpay_payment_id);
        
        const isAuthentic = expectedSignature === razorpay_signature;
        if (isAuthentic) {
             // Update the status to 'paid'
      await db.razorpayCustomer.update({
        where: {
            orderId: orderId,
            userId:user.id!
          },
        data: {
          status: "paid",
        },
      });

      const data =   await db.purchase.create({
        data: {
          courseId: courseId,
          userId: user.id!,
        }
      });
      

        } else {
            return NextResponse.json({
                message: "fail"
            }, {
                status: 400,
            })
        }

        return NextResponse.json({
            message: "success"
        }, {
            status: 200,
        })

    } catch (error: any) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}