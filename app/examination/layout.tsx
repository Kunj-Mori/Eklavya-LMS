import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ExaminationLayoutClient from "./ExaminationLayoutClient";

export default function ExaminationLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <ExaminationLayoutClient>
      {children}
    </ExaminationLayoutClient>
  );
} 