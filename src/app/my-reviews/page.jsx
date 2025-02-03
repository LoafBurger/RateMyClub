"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MyReviews() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set the user's role
        }
        // Fetch user's reviews
        fetchReviews(currentUser.uid);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to fetch user's reviews
  const fetchReviews = async (userId) => {
    const reviewsRef = collection(db, "approved-reviews");
    const q = query(reviewsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const userReviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setReviews(userReviews);
  };

  //Function to edit a review
  const handleEdit = async (reviewId) => {
    router.push(`/rate-club?edit=${reviewId}`);
  };

  // Function to delete a review
  const handleDelete = async (reviewId) => {
    try {
      await deleteDoc(doc(db, "approved-reviews", reviewId));
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId),
      );
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="w-full bg-[#00a6fb] p-4 shadow-lg mb-3.5">
        <div className="container mx-auto flex justify-between items-center">
          <h1
            className="text-3xl font-bold text-white cursor-pointer flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            RateMyClub
          </h1>
          {!user ? (
            <button
              onClick={() => router.push("/sign-up")}
              className="px-6 py-2 bg-white text-[#00a6fb] rounded-full font-semibold hover:bg-blue-50 transition duration-300"
            >
              Sign In/Up
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-white bg-[#0087c1] px-4 py-2 rounded-full">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black rounded-full hover:bg-gray-800 transition duration-300 text-white"
              >
                Log Out
              </button>
              {userRole === "admin" && (
                <button
                  onClick={() => router.push("/admin-panel")}
                  className="px-4 py-2 bg-white text-[#00a6fb] rounded-full hover:bg-blue-50 transition duration-300 font-semibold"
                >
                  Admin Panel
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 pt-16">
        <h1 className="text-4xl font-bold mb-8 text-[#00a6fb]">My Reviews</h1>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-lg mb-8 text-gray-900"
            >
              <h2 className="text-2xl font-semibold underline text-[#00a6fb]">
                {review.reviewTitle}
              </h2>
              <p className="text-gray-700 my-4">"{review.detailedReview}"</p>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Other Metrics:</h3>
                <p className="text-gray-800">University: {review.university}</p>
                <p className="text-gray-800">Club: {review.clubName}</p>
                <p className="text-gray-800">Category: {review.category}</p>
                <p className="text-gray-800">
                  Rating: {review.overallRating}/10
                </p>
                <p className="text-gray-800">
                  Organization: {review.Organization}
                </p>
                <p className="text-gray-800">
                  Social Environment: {review.SocialEnvironment}
                </p>
                <p className="text-gray-800">
                  Value for Money: {review.ValueForMoney}
                </p>
                <p className="text-gray-800">Networking: {review.Networking}</p>
              </div>
              <div className="flex mt-6 space-x-4">
                <button
                  onClick={() => handleEdit(review.id)}
                  className="px-6 py-2 bg-[#00a6fb] text-white rounded-full hover:bg-blue-600 transition duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            You haven't submitted any reviews yet.
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
