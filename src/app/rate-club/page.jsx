"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function RateClub() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  console.log(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      await addDoc(collection(db, "reviews"), {
        userId: user.uid, // Store the user ID
        userEmail: user.email, // Optional: Store user's email
        ...formData, // Store all form data
        timestamp: serverTimestamp(), // Add a timestamp
      });

      alert("Review submitted successfully!");
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
      router.push("/");
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
            <button
              onClick={() => signOut(auth)}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
            >
              Log Out
            </button>
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
        className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-3.5"
      >
        {/* Club Information */}
        <div className="mb-4">
          <label className="block mb-2">University Name</label>
          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
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
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Club Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
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

        {/* Rating System */}
        <div className="mb-4">
          <label className="block mb-2">Overall Rating (1-10)</label>
          <input
            type="number"
            name="overallRating"
            min="1"
            max="10"
            value={formData.overallRating}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        {[
          "Organization",
          "SocialEnvironment",
          "ValueForMoney",
          "Networking",
          "EventQuality",
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
              className="w-full p-2 rounded bg-gray-700"
            />
          </div>
        ))}

        {/* Review Details */}
        <div className="mb-4">
          <label className="block mb-2">Title of Review</label>
          <input
            type="text"
            name="reviewTitle"
            value={formData.reviewTitle}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Detailed Review</label>
          <textarea
            name="detailedReview"
            value={formData.detailedReview}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 h-32"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Pros</label>
          <input
            type="text"
            name="pros"
            value={formData.pros}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Cons</label>
          <input
            type="text"
            name="cons"
            value={formData.cons}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
          />
        </div>

        <div className="mb-4 flex items-center">
          <label className="mr-2">Would you recommend this club?</label>
          <input
            type="checkbox"
            name="recommend"
            checked={formData.recommend}
            onChange={handleChange}
            className="w-5 h-5"
          />
        </div>

        {/* User Information */}
        <div className="mb-4 flex items-center">
          <label className="mr-2">Are you a current or former member?</label>
          <input
            type="checkbox"
            name="isMember"
            checked={formData.isMember}
            onChange={handleChange}
            className="w-5 h-5"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Your Role in the Club</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
          >
            <option value="">Select a role</option>
            {roles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-500"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
