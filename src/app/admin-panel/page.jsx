"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";

export default function AdminPanel() {
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/"); // Redirect if user is not logged in
        return;
      }
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role !== "admin") {
          router.push("/"); // Redirect if user is not an admin
        } else {
          setUserData(data);
          fetchReviews(); //Fetch only if the user is admin
        }
      }
    };
    checkAdminRole();
  }, [router]);

  const fetchReviews = async () => {
    const reviewsRef = collection(db, "reviews");
    const querySnapshot = await getDocs(reviewsRef);

    const fetchedReviews = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setReviews(fetchedReviews);
  };

  const handleApprove = async (review) => {
    // Move to approved-reviews collection
    const approvedRef = doc(db, "approved-reviews", review.id);
    await setDoc(approvedRef, review);

    // Delete from the reviews collection
    const reviewRef = doc(db, "reviews", review.id);
    await deleteDoc(reviewRef);

    // Refresh reviews list
    fetchReviews();
  };

  const handleDeny = async (review) => {
    // Remove the review from the "reviews" collection
    const reviewRef = doc(db, "reviews", review.id);
    await deleteDoc(reviewRef);

    // Refresh reviews list
    fetchReviews();
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

  if (!userData) {
    return <div>Loading...</div>; // Show loading state while checking the role
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => router.push("/")}
          >
            RMC
          </h1>
          {!userData ? (
            <button
              onClick={() => router.push("/sign-up")}
              className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-200"
            >
              Sign In/Up
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-white">{userData.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
              >
                Log Out
              </button>
              {/* Conditionally render the Admin Panel button if the user is an admin */}
              {userData && userData.role === "admin" && (
                <button
                  onClick={() => router.push("/admin-panel")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                >
                  Admin Panel - Approve Requests
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Pending Reviews</h1>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-4 mb-4 rounded">
              <h2 className="text-xl font-semibold underline">
                {review.reviewTitle}
              </h2>
              <p className="text-white mb-3.5">"{review.detailedReview}"</p>
              <h2 className="text-xl font-semibold">Other Metrics:</h2>
              <p className="text-white">University: {review.university}</p>
              <p className="text-white">Club: {review.clubName}</p>
              <p className="text-white">Category: {review.category}</p>
              <p className="text-white">Rating: {review.overallRating}/10</p>

              {/* Approve and Deny Buttons */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleApprove(review)}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(review)}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No pending reviews...</p>
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
