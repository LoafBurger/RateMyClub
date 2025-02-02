"use client";
import Image from "next/image";
//import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  console.log(user);

  //check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data
        const userDoc = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No user data found!");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const cards = [
    {
      title: "Rate a Club",
      description:
        "Share your thoughts and rate your favorite clubs to help the community.",
      buttonText: "Rate Now",
      link: "/rate-club", // Add the link to the rating page
    },

    {
      title: "Explore Clubs",
      description:
        "Browse through a list of clubs and see what others have to say.",
      buttonText: "Explore",
      link: "explore-page",
    },
    {
      title: "My Reviews",
      description: "View and manage all your submitted reviews in one place.",
      buttonText: "View Reviews",
      link: "my-reviews",
    },
  ];

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
      {/* Header Section */}
      <header className="bg-gray-800 p-4 shadow-lg">
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

      {/* Middle Section */}
      <main className="flex-grow container mx-auto py-16 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">RateMyClub</h1>
        <p className="text-lg text-gray-300 mb-8">
          Explore and rate your favorite clubs. Share your experiences and help
          others discover great opportunities!
        </p>

        {/* Cards Display Section */}
        <section className="py-16 mt-32">
          <div className="flex items-center justify-center w-full space-x-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className="w-96 h-56 bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400 mb-4">{card.description}</p>
                <button
                  onClick={() => router.push(card.link)}
                  className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                >
                  {card.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 p-4 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
