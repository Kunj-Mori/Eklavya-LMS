"use client";
import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";
import { useMemo } from "react";

interface PreviewProps {
  value: string;
}

function Preview({ value }: PreviewProps) {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  return <ReactQuill theme="bubble" value={value} readOnly />;
}

export default Preview;
