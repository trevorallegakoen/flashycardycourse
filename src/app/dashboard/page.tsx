import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Welcome back, {user?.firstName || user?.emailAddresses[0].emailAddress}!
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">My Flashcards</h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your flashcard collections
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Study Sessions</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your learning progress
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your learning experience
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🎉 You're authenticated!</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This is a protected page that only authenticated users can access. 
            If you weren't logged in, you would have been redirected to the home page.
          </p>
        </div>
      </div>
    </div>
  );
}

