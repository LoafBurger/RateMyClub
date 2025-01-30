"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MyReviews() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        const userReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(userReviews);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="w-full bg-gray-800 p-4 shadow-lg mb-3.5">
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

      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">My Reviews</h1>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-4 mb-4 rounded">
              <h2 className="text-xl font-semibold">
                Review Title: {review.reviewTitle}
              </h2>
              <p className="text-white mb-3.5">{review.detailedReview}</p>
              <h2 className="text-xl font-semibold">Other Stats:</h2>
              <p className="text-white">University: {review.university}</p>
              <p className="text-white">Club: {review.clubName}</p>
              <p className="text-white">Category: {review.category}</p>
              <p className="text-white">Rating: {review.overallRating}/10</p>
              <p className="text-white">Organization: {review.Organization}</p>
              <p className="text-white">
                Social Environment: {review.SocialEnvironment}
              </p>
              <p className="text-white">
                Value for Money: {review.ValueForMoney}
              </p>
              <p className="text-white">Networking: {review.Networking}</p>
              <p className="text-white">Event Quality: {review.EventQuality}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            You haven't submitted any reviews yet.
          </p>
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
