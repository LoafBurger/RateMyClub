"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function AdminPanel() {
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in
        router.push("/");
        setLoading(false);
        return;
      }

      try {
        // User is logged in, check if they're an admin
        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.role === "admin") {
            // User is an admin
            setUserData(data);
            fetchReviews();
          } else {
            // User is not an admin
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
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

  const handleEdit = (review) => {
    setEditingReview({
      ...review,
      newUniversity: review.university,
      newClubName: review.clubName,
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Update the review in the reviews collection
      const reviewRef = doc(db, "reviews", editingReview.id);
      await updateDoc(reviewRef, {
        university: editingReview.newUniversity,
        clubName: editingReview.newClubName,
      });

      // Refresh the reviews list
      fetchReviews();
      setEditingReview(null);
    } catch (error) {
      console.error("Error updating review:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-[#00a6fb] p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
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
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-white bg-[#0087c1] px-4 py-2 rounded-full text-sm sm:text-base max-w-[200px]">
                {userData.email}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-black rounded-full hover:bg-gray-800 transition duration-300 text-white whiteespace-nowrap"
                >
                  Log Out
                </button>
                {userData.role === "admin" && (
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

      {/* Content */}
      <main className="flex-grow container mx-auto px-4 py-20 -mt-10 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-[#00a6fb]">
          Pending Reviews
        </h1>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800 p-6 rounded-lg shadow-md mb-8"
            >
              <h2 className="text-2xl font-semibold text-[#00a6fb] underline mb-4">
                {review.reviewTitle}
              </h2>
              <p className="text-gray-400 mb-4">"{review.detailedReview}"</p>
              <div className="space-y-2 text-gray-400">
                {editingReview?.id === review.id ? (
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        University Name:
                      </label>
                      <input
                        type="text"
                        value={editingReview.newUniversity}
                        onChange={(e) =>
                          setEditingReview({
                            ...editingReview,
                            newUniversity: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00a6fb]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Club Name:
                      </label>
                      <input
                        type="text"
                        value={editingReview.newClubName}
                        onChange={(e) =>
                          setEditingReview({
                            ...editingReview,
                            newClubName: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#00a6fb]"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-green-600 rounded-full hover:bg-green-500 transition duration-300 text-white"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingReview(null)}
                        className="px-4 py-2 bg-gray-600 rounded-full hover:bg-gray-500 transition duration-300 text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>University: {review.university}</p>
                    <p>Club: {review.clubName}</p>
                  </>
                )}
                <p>Category: {review.category}</p>
                <p>Rating: {review.overallRating}/10</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6">
                {editingReview?.id !== review.id && (
                  <button
                    onClick={() => handleEdit(review)}
                    className="px-6 py-2 bg-yellow-600 rounded-full hover:bg-yellow-500 transition duration-300"
                  >
                    Edit Names
                  </button>
                )}
                <button
                  onClick={() => handleApprove(review)}
                  className="px-6 py-2 bg-[#00a6fb] rounded-full hover:bg-blue-600 transition duration-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(review)}
                  className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-500 transition duration-300"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            No pending reviews need to be approved...
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
