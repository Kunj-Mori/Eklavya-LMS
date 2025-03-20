"use client";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SearchInput } from "@/components/SearchInput";

function NavbarRoutes() {
  const pathname = usePathname();
  const user = useUser()
  const role = user?.user?.publicMetadata?.role;
  
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/chapter");
  const isSearchPage = pathname === "/search";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
        <div className="flex gap-x-2 ml-auto">
          {role === "instructor" && (
            isTeacherPage || isPlayerPage ? (
              <Link href="/">
                <Button size="sm" variant="ghost">
                  <LogOut className="h-6 w-6" />
                  Exit
                </Button>
              </Link>
            ) : (
              <Link href="/teacher/courses">
                <Button size="sm" variant="ghost">
                  Teacher mode
                </Button>
              </Link>
            )
          )}
          <UserButton />
        </div>
    </>
  );
}

export default NavbarRoutes;
