"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Sidebar from "../(Dashboard)/_components/Sidebar";

export default function ExaminationLayoutClient({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-white shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center ml-2 md:hidden">
            <Image 
              src="/logo.png" 
              alt="Eklavya Logo" 
              width={32} 
              height={32} 
              className="h-8 w-auto mr-2"
            />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Eklavya</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="flex h-[calc(100%-3.5rem)]">
        {/* Sidebar - hidden on mobile by default */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 md:w-64 md:static 
          transform transition-transform duration-300 ease-in-out
          h-full pt-14 md:pt-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <div className="md:hidden absolute top-2 right-2 z-10">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
} 