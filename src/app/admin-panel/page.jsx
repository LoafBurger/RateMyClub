"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, deleteDoc, setDoc,
} from "firebase/firestore";

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
      {/* Header */}
      <header className="bg-[#00a6fb] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1
            className="text-3xl font-bold text-white cursor-pointer flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <span className="text-white">RateMyClub</span>
          </h1>
          {!userData ? (
            <button
              onClick={() => router.push("/sign-up")}
              className="px-6 py-2 bg-white text-[#00a6fb] rounded-full font-semibold hover:bg-blue-50 transition duration-300"
            >
              Sign In/Up
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-white bg-[#0087c1] px-4 py-2 rounded-full">
                {userData.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black rounded-full hover:bg-gray-800 transition duration-300 text-white"
              >
                Log Out
              </button>
              {userData.role === "admin" && (
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

      {/* Content */}
      <main className="flex-grow container mx-auto px-4 py-20 -mt-10 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-[#00a6fb]">Pending Reviews</h1>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-[#00a6fb] underline mb-4">
                {review.reviewTitle}
              </h2>
              <p className="text-gray-400 mb-4">"{review.detailedReview}"</p>
              <div className="space-y-2 text-gray-400">
                <p>University: {review.university}</p>
                <p>Club: {review.clubName}</p>
                <p>Category: {review.category}</p>
                <p>Rating: {review.overallRating}/10</p>
              </div>

              {/* Approve and Deny Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => handleApprove(review)}
                  className="px-6 py-2 bg-[#00a6fb] rounded-full hover:bg-blue-600 transition duration-300 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(review)}
                  className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-500 transition duration-300 text-white"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No pending reviews need to be approved...</p>
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
