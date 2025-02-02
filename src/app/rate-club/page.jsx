"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function RateClub() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("edit");

  console.log(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (reviewId) {
        const reviewDoc = await getDoc(doc(db, "reviews", reviewId));
        if (reviewDoc.exists()) {
          setFormData(reviewDoc.data()); // Prefill form with existing data
        }
      }
    });
    return () => unsubscribe();
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

    const handleLogout = async () => {
      try {
        await signOut(auth);
        // Redirect to home page after sign out
        router.push("/");
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    };

    try {
      if (reviewId) {
        // Editing an existing review
        await setDoc(doc(db, "reviews", reviewId), {
          userId: user.uid,
          userEmail: user.email,
          ...formData,
          timestamp: serverTimestamp(),
        });

        alert("Review updated successfully!");
        router.push("/my-reviews"); // Redirect to "My Reviews" after editing
      } else {
        // Creating a new review
        await addDoc(collection(db, "reviews"), {
          userId: user.uid,
          userEmail: user.email,
          ...formData,
          timestamp: serverTimestamp(),
        });

        alert("Review submitted successfully - RMC admins will now review your submission!");
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="w-full bg-gray-800 p-4 shadow-lg">
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
            <div className="flex items-center space-x-4">
              <span className="text-white">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <header className="text-center py-6 mt-6">
        <h1 className="text-3xl font-bold">Rate a Club</h1>
        <p className="text-gray-400">
          Share your experience with the community!
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg mb-10 space-y-6"
      >
        {/* Club Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block mb-2">University Name</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Club Name</label>
            <input
              type="text"
              name="clubName"
              value={formData.clubName}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Club Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700"
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
            <label className="block mb-2">Overall Rating (1-10)</label>
            <input
              type="number"
              name="overallRating"
              min="1"
              max="10"
              value={formData.overallRating}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700"
              required
            />
          </div>
        </div>

        {/* Rating System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full p-3 rounded bg-gray-700"
              />
            </div>
          ))}
        </div>

        {/* Review Details */}
        <div className="grid grid-cols-1 gap-6">
          <div className="mb-4">
            <label className="block mb-2">Title of Review</label>
            <input
              type="text"
              name="reviewTitle"
              value={formData.reviewTitle}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Detailed Review</label>
            <textarea
              name="detailedReview"
              value={formData.detailedReview}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 h-40"
              required
            />
          </div>


          <div className="mb-4 flex items-center">
            <label className="mr-3 text-lg">
              Would you recommend this club?
            </label>
            <input
              type="checkbox"
              name="recommend"
              checked={formData.recommend}
              onChange={handleChange}
              className="w-6 h-6"
            />
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition duration-300"
        >
          Submit Review
        </button>
      </form>

      {/* Footer */}
      <footer className="bg-gray-800 p-4 text-center mt-auto">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
