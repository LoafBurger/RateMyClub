"use client";
import { auth, db } from "@/app/firebase/config"; //getting auth object using getAuth from config, getting db object using getFirestore from config
import { useRouter, useSearchParams } from "next/navigation"; //routing for pushing to other pages
import { onAuthStateChanged, signOut } from "firebase/auth"; //used to monitor user logging in and out (user state), just helps with signing out of a user
import { useState, useEffect } from "react"; //useState just manages states of stuff, useEffect handles side effects of the application
import { doc, getDoc } from "firebase/firestore"; //doc is to create a reference (not actually get the data) to a document on Firestore, getDoc is to actually get the data
import ClubReviewSection from "@/components/ClubReviewSection";

export default function Home() {
  //react component
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: "",
  });
  const searchParams = useSearchParams();

  console.log(user);

  useEffect(() => {
    // Check if user just signed in
    const justSignedIn = searchParams.get("signed_in");
    if (justSignedIn === "true") {
      setToastConfig({
        show: true,
        message: "Successfully signed in!",
      });
      setTimeout(() => {
        setToastConfig({
          show: false,
          message: "",
        });
      }, 2000);
    }
  }, [searchParams]);

  //check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      //remember, use async/await to ensure that data is fetched before updating component state. Inside the onAuthStateChanged callback, you're waiting (await) for the result of getDoc to fetch user data from Firestore, if the currentUser exists.
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
    return () => unsubscribe(); //cleanup function that helps with cleaning up any side effects
  }, []); //empty array means the useEffect runs once when the component loads

  const cards = [
    {
      title: "Rate a Club",
      description:
        "Share your thoughts and rate your favorite clubs from your university to help the community.",
      buttonText: "Rate Now",
      link: "/rate-club", // Add the link to the rating page
    },

    {
      title: "Explore Clubs",
      description:
        "Browse through a list of clubs from any university and see what others have to say.",
      buttonText: "Explore",
      link: "universities-page",
    },
    {
      title: "My Reviews",
      description:
        "View, edit, and delete all your submitted reviews in one place.",
      buttonText: "View Reviews",
      link: "my-reviews",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToastConfig({
        show: true,
        message: "Successfully logged out!",
      });
      setTimeout(() => {
        setToastConfig({
          show: false,
          message: "",
        });
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* New Logout Toast - now at the top */}
      <div
        className={`fixed top-0 left-0 right-0 transform ${toastConfig.show ? "translate-y-0" : "-translate-y-full"
          } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex items-center justify-center p-4">
          <div className="bg-black text-white px-8 py-4 rounded-full shadow-lg flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">{toastConfig.message}</span>
          </div>
        </div>
      </div>

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
                {userData && userData.role === "admin" && (
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
              <span className="text-white">Discover</span> &
              <span className="text-white"> Rate</span>
              <br />
              University Clubs
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Join thousands of students sharing their experiences and
              discovering amazing opportunities in university clubs!
            </p>
          </div>
        </div>
        {/* Wave SVG Separator */}
        <div className="absolute w-full">
          <svg
            className="w-full h-24 translate-y-1"
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 50L48 45.7C96 41.3 192 32.7 288 29.2C384 25.7 480 27.3 576 35.8C672 44.3 768 59.7 864 64.2C960 68.7 1056 62.3 1152 55.8C1248 49.3 1344 42.7 1392 39.3L1440 36V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-20 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            >
              {/* Card Icon Section */}
              <div className="h-32 bg-[#e6f6fd] flex items-center justify-center">
                {index === 0 && (
                  <svg
                    className="w-16 h-16 text-[#00a6fb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                )}
                {index === 1 && (
                  <svg
                    className="w-16 h-16 text-[#00a6fb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
                {index === 2 && (
                  <svg
                    className="w-16 h-16 text-[#00a6fb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                )}
              </div>
              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-6">{card.description}</p>
                <button
                  onClick={() => router.push(card.link)}
                  className="w-full px-6 py-3 bg-[#00a6fb] text-white rounded-lg hover:bg-[#0093d4] transition duration-300 font-semibold"
                >
                  {card.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ClubReviewSection />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push("/about")}
                className="text-gray-600 hover:text-[#00a6fb] transition duration-300"
              >
                About
              </button>
            </div>
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} RateMyClub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
