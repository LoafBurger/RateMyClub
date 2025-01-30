"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MyReviews() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">My Reviews</h1>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="bg-gray-800 p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">Review Title: {review.reviewTitle}</h2>
            <p className="text-white mb-3.5">{review.detailedReview}</p>
            <h2 className="text-xl font-semibold">Other Stats:</h2>
            <p className="text-white">University: {review.university}</p>
            <p className="text-white">Club: {review.clubName}</p>
            <p className="text-white">Category: {review.category}</p>
            <p className="text-white">Rating: {review.overallRating}/10</p>
            <p className="text-white">Organization: {review.Organization}</p>
            <p className="text-white">Social Environment: {review.SocialEnvironment}</p>
            <p className="text-white">Value for Money: {review.ValueForMoney}</p>
            <p className="text-white">Networking: {review.Networking}</p>
            <p className="text-white">Event Quality: {review.EventQuality}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">You haven't submitted any reviews yet.</p>
      )}
    </div>
  );
}

