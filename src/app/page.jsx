"use client";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  console.log(user);

  useEffect(() => {
    if (!user) {
      router.replace("/sign-up");
    } else {
      //fetch user data from Firestore
      const fetchUserData = async () => {
        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else{
          console.log("No user data found!");
        }
      };
      fetchUserData();
    }
  }, [user, router]); // Run this effect when `user` or `router` changes.

  if (!user) {
    // Optionally, you can return null or a loading spinner while the user is being redirected
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">RateMyClub</h1>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <p className="text-lg text-gray-400">
            Explore and rate your favorite clubs. Share your experiences and help others discover great opportunities!
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Example Card: Add more cards as needed */}
          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Explore Clubs</h3>
            <p className="text-gray-400 mb-4">
              Browse through the list of clubs and find the ones that suit your interests.
            </p>
            <button className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500">
              Explore
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Rate a Club</h3>
            <p className="text-gray-400 mb-4">
              Share your thoughts and rate your favorite clubs to help the community.
            </p>
            <button className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500">
              Rate Now
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">My Reviews</h3>
            <p className="text-gray-400 mb-4">
              View and manage all your submitted reviews in one place.
            </p>
            <button className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500">
              View Reviews
            </button>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 p-4 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RateMyClub. All rights reserved to OC
        </p>
      </footer>
    </div>
  );

}
