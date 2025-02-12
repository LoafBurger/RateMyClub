"use client";

import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function UniversitiesPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [universities, setUniversities] = useState([]);
  const router = useRouter();

  // Fetch unique universities from approved-reviews
  const fetchUniversities = async () => {
    try {
      const reviewsRef = collection(db, "approved-reviews");
      const querySnapshot = await getDocs(reviewsRef);

      // Create a Set to store unique university names
      const uniqueUniversities = new Set();

      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        if (reviewData.university) {
          uniqueUniversities.add(reviewData.university);
        }
      });

      // Convert Set to sorted array
      const universitiesArray = Array.from(uniqueUniversities).sort();
      setUniversities(universitiesArray);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  //check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data
        const userDoc = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No user data found!");
        }
      }
    });
    // Fetch universities when component mounts
    fetchUniversities();
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page after sign out
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

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
          {!user ? (
            <button
              onClick={() => router.push("/sign-up")}
              className="px-6 py-2 bg-white text-[#00a6fb] rounded-full font-semibold hover:bg-blue-50 transition duration-300"
            >
              Sign In/Up
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-white bg-[#0087c1] px-4 py-2 rounded-full text-sm sm:text-base truncate max-w-[200px]">
                {user.email}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-black rounded-full hover:bg-gray-800 transition duration-300 text-white whitespace-nowrap"
                >
                  Log Out
                </button>
                {userData && userData.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin-panel")}
                    className="px-4 py-2 bg-white text-[#00a6fb] rounded-full hover:bg-blue-50 transition duration-300 font-semibold whitespace-nowrap"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Universities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((university) => (
            <div
              key={university}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-[#00a6fb] mb-2">
                {university}
              </h3>
              <button
                onClick={() =>
                  router.push(
                    `/university-clubs?university=${encodeURIComponent(university)}`,
                  )
                }
                className="mt-4 text-sm text-[#00a6fb] hover:text-blue-700 font-medium"
              >
                View Clubs →
              </button>
            </div>
          ))}
        </div>
        {universities.length === 0 && (
          <p className="text-gray-500 text-center">No universities found.</p>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
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
