"use client";
import toast from "react-hot-toast";
import { UploadDropzone } from "@/lib/uploadingthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadingProps {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadingProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  );
};
