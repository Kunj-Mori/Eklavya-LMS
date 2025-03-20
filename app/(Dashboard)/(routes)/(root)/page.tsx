import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle, Clock, InfoIcon, BookOpen } from "lucide-react";
import { getDashboardCourses } from "@/actions/get-dashboard-progress";
import { BannerCard } from "./_components/BannerCard";
import { InfoCard } from "./_components/InfoCard";
import { CourseList } from "@/components/CourseList";

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="theme-card rounded-xl overflow-hidden shadow-lg border-[1px] border-blue-100">
          <div className="p-6 relative">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full opacity-5 blur-3xl"></div>
            <div className="flex items-start gap-4 z-10 relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-lg text-white">
                <InfoIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Welcome to your dashboard
                </h2>
                <p className="text-slate-600">
                  This is where you can see your progress and continue your courses. This is a demonstration LMS and as such, all courses are free and Stripe is in test mode. To enroll in a course, enter dummy data in the Stripe form.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="theme-card p-6 rounded-xl flex items-center gap-4 shadow-md border-[1px] border-blue-100 transition-transform hover:-translate-y-1 duration-300">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Clock className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">In Progress</p>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
              {coursesInProgress.length}
            </h3>
          </div>
        </div>
        
        <div className="theme-card p-6 rounded-xl flex items-center gap-4 shadow-md border-[1px] border-green-100 transition-transform hover:-translate-y-1 duration-300">
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <p className="text-slate-600 text-sm">Completed</p>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-400">
              {completedCourses.length}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <h2 className="text-2xl font-bold mb-6 relative inline-block">
          Your Courses
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </h2>
        
        {coursesInProgress.length === 0 && completedCourses.length === 0 ? (
          <div className="theme-card flex flex-col items-center justify-center p-12 text-center mt-8 border-[1px] border-blue-100 rounded-xl shadow-md">
            <BookOpen className="h-20 w-20 text-blue-500 mb-6" />
            <h3 className="text-2xl font-medium mb-3">No courses yet</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Explore our course catalog and enroll in a course to get started on your learning journey.
            </p>
            <a 
              href="/search"
              className="theme-button-primary px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="theme-card p-6 border-[1px] border-blue-100 rounded-xl shadow-md">
            <CourseList items={[...coursesInProgress, ...completedCourses]} />
          </div>
        )}
      </div>
    </div>
  );
}
