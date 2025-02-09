"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function RateClub() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); //new state for storing the users role
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("edit");

  console.log(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (reviewId) {
      const fetchReview = async () => {
        const reviewDoc = await getDoc(doc(db, "approved-reviews", reviewId));
        if (reviewDoc.exists()) {
          setFormData(reviewDoc.data()); // Prefill form with existing data
        }
      };
      fetchReview();
    }
  }, [reviewId]);

  const [formData, setFormData] = useState({
    university: "",
    clubName: "",
    category: "",
    overallRating: 0,
    Organization: 0,
    SocialEnvironment: 0,
    ValueForMoney: 0,
    Networking: 0,
    EventQuality: 0,
    reviewTitle: "",
    detailedReview: "",
    pros: "",
    cons: "",
    recommend: false,
    isMember: false,
    role: "",
  });

  const categories = [
    "Academic",
    "Sports",
    "Cultural",
    "Social",
    "Volunteering",
    "Professional",
  ];

  const roles = ["Member", "Executive", "Volunteer", "Attendee"];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page after sign out
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit a review.");
      return;
    }

    try {
      if (reviewId) {
        // Editing an existing review
        await setDoc(doc(db, "reviews", reviewId), {
          userId: user.uid,
          userEmail: user.email,
          ...formData,
          timestamp: serverTimestamp(),
        });

        // Step 2: After the review is successfully updated, delete the old review from the "approved-reviews" collection
        await deleteDoc(doc(db, "approved-reviews", reviewId));

        alert("Review updated successfully - RMC admins will now review your edited submission!");
        router.push("/my-reviews"); // Redirect to "My Reviews" after editing
      } else {
        // Creating a new review
        await addDoc(collection(db, "reviews"), {
          userId: user.uid,
          userEmail: user.email,
          ...formData,
          timestamp: serverTimestamp(),
        });

        alert(
          "Review submitted successfully - RMC admins will now review your submission!",
        );
        setFormData({
          university: "",
          clubName: "",
          category: "",
          overallRating: 0,
          Organization: 0,
          SocialEnvironment: 0,
          ValueForMoney: 0,
          Networking: 0,
          EventQuality: 0,
          reviewTitle: "",
          detailedReview: "",
          pros: "",
          cons: "",
          recommend: false,
          isMember: false,
          role: "",
        });

        router.push("/"); // Redirect to Home after new review submission
      }
    } catch (error) {
      console.error("Error submitting review:", error.message);
      alert("Failed to submit review. Please try again.");
    }

    console.log("Submitted Data:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 relative">
              <span className="text-white">Rate a University</span> Club
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Share your experiences and help others discover amazing clubs!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-20 -mt-10 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Club Rating Form
          </h2>

          {/* Club Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block mb-2 text-black">University Name</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-200 text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-black">Club Name</label>
              <input
                type="text"
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-200 text-black"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-black">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-200 text-black"
                required
              >
                <option value="">Select a Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-black">
                Overall Rating (1-10)
              </label>
              <input
                type="number"
                name="overallRating"
                min="1"
                max="10"
                value={formData.overallRating}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-200 text-black"
                required
              />
            </div>
          </div>

          {/* Rating System */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
            {[
              "Organization",
              "SocialEnvironment",
              "ValueForMoney",
              "Networking",
            ].map((field, index) => (
              <div key={index} className="mb-4">
                <label className="block mb-2">
                  {field.replace(/([A-Z])/g, " $1").trim()} (1-10)
                </label>
                <input
                  type="number"
                  name={field}
                  min="1"
                  max="10"
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-200"
                  required
                />
              </div>
            ))}
          </div>

          {/* Review */}
          <div className="mb-4">
            <label className="block mb-2 text-black">Review Title</label>
            <input
              type="text"
              name="reviewTitle"
              value={formData.reviewTitle}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-200 text-black"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-black">Detailed Review</label>
            <textarea
              name="detailedReview"
              value={formData.detailedReview}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-200 text-black"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="mb-4 flex items-center gap-4 text-black">
            <input
              type="checkbox"
              name="recommend"
              checked={formData.recommend}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span>Would you recommend this club to others?</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#00a6fb] text-white rounded-lg hover:bg-[#0087c1] transition duration-300"
          >
            {reviewId ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
