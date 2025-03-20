"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useRouter } from "next/navigation";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
  
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onClick = async () => {
    try {
      setIsLoading(true);

      // Call your backend API to create a Razorpay order
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      const { orderId, amount } = response.data;

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key ID
        amount: amount, // Amount in paise
        currency: "INR",
        name: "Eklavya",
        description: "Learning Management System Course Enrollment",
        order_id: orderId, // Order ID from backend
        handler: async function (response: any) {
          // Handle payment success
          // Optionally, send payment details to your backend for verification
          await axios.post("/api/paymentverify", {
            orderId: orderId,
            razorpay_order_id: orderId,
            courseId: courseId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          router.push("/");
          toast.success("Payment successful!");
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      const model = await paymentObject.open();
      
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      Enroll for {formatPrice(price)}
    </Button>
  );
};
