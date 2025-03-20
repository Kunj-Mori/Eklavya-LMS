"use client";
import React from "react";
import { Layout, Compass, List, BarChart, UserRoundSearch, BookOpen } from "lucide-react";
import SideBarItem from "./SideBarItem";
import { usePathname } from "next/navigation";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
  {
    icon: UserRoundSearch,
    label: "Examination",
    href: "/examination",
  }
];

const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/teacher/analytics",
  },
  {
    icon: BookOpen,
    label: "Assessments",
    href: "/assessment",
  }
];

function SidebarRoutes() {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;
  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SideBarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
}

export default SidebarRoutes;
 