"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function UniversityClubs() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [universityName, setUniversityName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const university = searchParams.get("university");
    if (university) {
      setUniversityName(decodeURIComponent(university));
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      if (!universityName) return;

      const reviewsRef = collection(db, "approved-reviews");
      const q = query(reviewsRef, where("university", "==", universityName));
      const querySnapshot = await getDocs(q);
      
      // Create a Map to store unique clubs and their review counts
      const clubsMap = new Map();
      
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        if (reviewData.clubName) {
          const currentCount = clubsMap.get(reviewData.clubName) || 0;
          clubsMap.set(reviewData.clubName, currentCount + 1);
        }
      });
      
      // Convert Map to array of objects with club names and review counts
      const clubsArray = Array.from(clubsMap, ([name, reviewCount]) => ({
        name,
        reviewCount
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setClubs(clubsArray);
    };

    fetchClubs();
  }, [universityName]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
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
                {userRole === "admin" && (
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0096d1] via-[#00a6fb] to-[#00a6fb] text-white pb-20 pt-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">{universityName}</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse through clubs at {universityName}
          </p>
          <button
            onClick={() => router.push("/universities-page")}
            className="bg-white text-[#00a6fb] px-6 py-2 rounded-full hover:bg-blue-50 transition duration-300"
          >
            ← Back to Universities
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-grow container mx-auto px-4 py-20 -mt-10 relative z-10">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-8 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a6fb] rounded-full"
        />

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.name}
              className="bg-white p-6 rounded-lg shadow-md text-gray-900 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/university-reviews?university=${encodeURIComponent(universityName)}&club=${encodeURIComponent(club.name)}`)}
            >
              <h2 className="text-xl font-semibold text-[#00a6fb] mb-2">
                {club.name}
              </h2>
              <p className="text-gray-600">
                {club.reviewCount} {club.reviewCount === 1 ? 'review' : 'reviews'}
              </p>
              <button
                className="mt-4 text-sm text-[#00a6fb] hover:text-blue-700 font-medium"
              >
                View Reviews →
              </button>
            </div>
          ))}
        </div>
        {filteredClubs.length === 0 && (
          <p className="text-gray-400 text-center">
            No clubs found for this university...
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 p-4 text-center mt-auto">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
