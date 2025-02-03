"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); //state to store the user's role
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); //State for search input
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set the user's role
        }
      } else {
        setUser(null);
        setUserRole(null); // Clear user and role if logged out
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsRef = collection(db, "approved-reviews");
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
      review.reviewTitle.toLowerCase().includes(lowerCaseQuery) ||
      review.university.toLowerCase().includes(lowerCaseQuery) ||
      review.clubName.toLowerCase().includes(lowerCaseQuery) ||
      review.category.toLowerCase().includes(lowerCaseQuery) ||
      review.detailedReview.toLowerCase().includes(lowerCaseQuery)
    );
  });

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
      <header className="bg-[#00a6fb] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0096d1] via-[#00a6fb] to-[#00a6fb] text-white pb-20 pt-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">Explore Reviews</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse through club reviews and discover the best fit for you.
          </p>
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
            </div>
          ))
        ) : (
          <p className="text-gray-400">No reviews found...</p>
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
