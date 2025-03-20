import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Upload complete ");
    }),

  courseAttachment: f(["pdf", "image", "video", "audio", "text"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Upload complete ");
    }),

  chapterVideo: f({ video: { maxFileSize: "1GB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Upload complete ");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
