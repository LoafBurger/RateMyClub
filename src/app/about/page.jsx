"use client";
import AboutContent from '@/components/AboutContent';
import { useRouter } from "next/navigation";


export default function About() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Header */}
      <header className="bg-[#00a6fb] p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1
            className="text-3xl font-bold text-white cursor-pointer flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <span className="text-white">RateMyClub</span>
          </h1>
          {/* Add your existing header content here */}
        </div>
      </header>

      {/* Main Content */}
      <AboutContent />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
