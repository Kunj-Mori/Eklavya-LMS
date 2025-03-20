import React from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white">
        <SheetClose asChild>
          <Sidebar />
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}

export default MobileSidebar;
