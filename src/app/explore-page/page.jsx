"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); //State for search input
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsRef = collection(db, "reviews");
      const querySnapshot = await getDocs(reviewsRef);

      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(fetchedReviews);
    };

    fetchReviews();
  }, []);

  // Filtered reviews based on search input
  const filteredReviews = reviews.filter((review) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      review.detailedReview.toLowerCase().includes(lowerCaseQuery) ||
      review.reviewTitle.toLowerCase().includes(lowerCaseQuery) ||
      review.clubName.toLowerCase().includes(lowerCaseQuery) ||
      review.university.toLowerCase().includes(lowerCaseQuery) ||
      review.category.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => router.push("/")}
          >
            RMC
          </h1>
          {!user ? (
            <button
              onClick={() => router.push("/sign-up")}
              className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-200"
            >
              Sign In/Up
            </button>
          ) : (
            <button
              onClick={() => signOut(auth)}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow container mx-auto p-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 mb-6 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        />
        <h1 className="text-3xl font-bold mb-6">Explore Reviews</h1>
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-4 mb-4 rounded">
              <h2 className="text-xl font-semibold underline">
                {review.reviewTitle}
              </h2>
              <p className="text-white mb-3">"{review.detailedReview}"</p>
              <h2 className="text-lg font-semibold">Club: {review.clubName}</h2>
              <p className="text-white">University: {review.university}</p>
              <p className="text-white">Category: {review.category}</p>
              <p className="text-white">Rating: {review.overallRating}/10</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No matching reviews found...</p>
        )}
      </main>

      {/* Footer - Stuck to Bottom */}
      <footer className="bg-gray-800 p-4 text-center mt-auto">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
