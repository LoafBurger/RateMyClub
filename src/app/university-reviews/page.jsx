"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"; //arrayUnion and arrayRemove are utility functions to add and remove elements from a Firestore document. In this case, used for adding likes and dislikes values.
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function UniversityReviews() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [universityName, setUniversityName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get university name from URL, this is to decide what universities to display
    const university = searchParams.get("university");
    if (university) {
      setUniversityName(decodeURIComponent(university));
    }
  }, [searchParams]); //this means this effect will run when the component is loaded and when searchParams changes.

  useEffect(() => {
    //useEffect to handle getting user data
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

  // In the UniversityReviews component, update the useEffect that fetches reviews:

  useEffect(() => {
    const fetchReviews = async () => {
      if (!universityName) return;

      const reviewsRef = collection(db, "approved-reviews");
      let q = query(reviewsRef, where("university", "==", universityName));

      // Get club from URL parameters
      const clubName = searchParams.get("club");
      if (clubName) {
        q = query(
          reviewsRef,
          where("university", "==", universityName),
          where("clubName", "==", decodeURIComponent(clubName)),
        );
      }

      const querySnapshot = await getDocs(q);

      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(fetchedReviews);
    };

    fetchReviews();
  }, [universityName, searchParams]); // Add searchParams to dependencies

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      alert("Please sign in to vote!");
      return;
    }

    const reviewRef = doc(db, "approved-reviews", reviewId);
    const reviewDoc = await getDoc(reviewRef);
    const reviewData = reviewDoc.data();

    // Initialize arrays if they don't exist
    const likedBy = reviewData.likedBy || [];
    const dislikedBy = reviewData.dislikedBy || [];
    const userId = user.uid;

    if (voteType === "like") {
      if (likedBy.includes(userId)) {
        // Remove like
        await updateDoc(reviewRef, {
          likedBy: arrayRemove(userId),
          likes: (reviewData.likes || 0) - 1,
        });
      } else {
        // Add like and remove dislike if exists
        const updates = {
          likedBy: arrayUnion(userId),
          likes: (reviewData.likes || 0) + 1,
        };

        if (dislikedBy.includes(userId)) {
          updates.dislikedBy = arrayRemove(userId);
          updates.dislikes = (reviewData.dislikes || 0) - 1;
        }

        await updateDoc(reviewRef, updates);
      }
    } else {
      if (dislikedBy.includes(userId)) {
        // Remove dislike
        await updateDoc(reviewRef, {
          dislikedBy: arrayRemove(userId),
          dislikes: (reviewData.dislikes || 0) - 1,
        });
      } else {
        // Add dislike and remove like if exists
        const updates = {
          dislikedBy: arrayUnion(userId),
          dislikes: (reviewData.dislikes || 0) + 1,
        };

        if (likedBy.includes(userId)) {
          updates.likedBy = arrayRemove(userId);
          updates.likes = (reviewData.likes || 0) - 1;
        }

        await updateDoc(reviewRef, updates);
      }
    }

    // Refresh reviews after voting
    const updatedReviewDoc = await getDoc(reviewRef);
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, ...updatedReviewDoc.data() }
          : review,
      ),
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      review.reviewTitle.toLowerCase().includes(lowerCaseQuery) ||
      review.clubName.toLowerCase().includes(lowerCaseQuery) ||
      review.category.toLowerCase().includes(lowerCaseQuery) ||
      review.detailedReview.toLowerCase().includes(lowerCaseQuery)
    );
  });

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
            Browse through club reviews at {universityName}
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
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-8 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a6fb] rounded-full"
        />

        {/* Review List */}
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-md mb-6 text-gray-900"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-semibold underline text-[#00a6fb]">
                  {review.reviewTitle}
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(review.id, "like")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${review.likedBy?.includes(user?.uid)
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                      } hover:bg-green-50 transition-colors`}
                  >
                    <ThumbsUp size={16} />
                    <span>{review.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleVote(review.id, "dislike")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${review.dislikedBy?.includes(user?.uid)
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                      } hover:bg-red-50 transition-colors`}
                  >
                    <ThumbsDown size={16} />
                    <span>{review.dislikes || 0}</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 my-4">"{review.detailedReview}"</p>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Other Metrics:</h3>
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
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            No reviews found for this university...
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
