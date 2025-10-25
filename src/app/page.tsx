import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Heading with gradient text */}
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent animate-gradient">
                Master Anything with
              </span>
              <br />
              <span className="text-white">Flashy Cardy Course</span>
            </h1>

            <p className="text-xl sm:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Transform your learning journey with intelligent flashcards. 
              Study smarter, retain longer, achieve more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <SignedOut>
                <p className="text-lg text-gray-300 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  🚀 Sign in to access your personalized dashboard and start learning!
                </p>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
                >
                  Go to Dashboard
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </SignedIn>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Learning</h3>
                <p className="text-gray-300">
                  AI-powered flashcards that adapt to your learning pace and style
                </p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Study on-the-go with instant access to all your flashcard decks
                </p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
                <p className="text-gray-300">
                  Monitor your learning journey with detailed analytics and insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-16 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-300">Active Learners</div>
            </div>
            <div className="hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-300">Flashcards Created</div>
            </div>
            <div className="hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-300">Retention Rate</div>
            </div>
            <div className="hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300">Access Anywhere</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
