"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
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
        <h1 className="text-3xl font-bold mb-6">Explore Reviews</h1>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-4 mb-4 rounded">
              <h2 className="text-xl font-semibold underline">Review Title: {review.reviewTitle}</h2>
              <p className="text-white mb-3">"{review.detailedReview}"</p>
              <h2 className="text-lg font-semibold">Club: {review.clubName}</h2>
              <p className="text-gray-400">University: {review.university}</p>
              <p className="text-gray-400">Category: {review.category}</p>
              <p className="text-gray-400">Rating: {review.overallRating}/10</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No reviews available yet...</p>
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

