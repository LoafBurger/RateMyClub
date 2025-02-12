"use client";
import { useState, useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleProvider, db } from "@/app/firebase/config";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPopup, signOut } from "firebase/auth"; // Import signInWithPopup from firebase/auth
import { doc, getDoc } from "firebase/firestore"; // To get the user document

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //To show validation or API errors
  //test account, testtest123, testtest123314
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter(); //reroute user after sign-in
  const searchParams = useSearchParams();

  useEffect(() => {
    const needSignOut = searchParams.get("need-sign-up");

    // If redirected from failed Google sign-in, sign out
    if (needSignOut === "true") {
      signOut(auth);
    } else {
      // Only check auth state if not redirected from failed sign-in
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            router.push("/");
          }
        }
      });
      return () => unsubscribe();
    }
  }, [router, searchParams]);

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log(res);
      if (!res) {
        setError("Invalid email or password. Please try again.");
        return;
      }
      setEmail("");
      setPassword("");
      router.push("/");
    } catch (e) {
      console.error(e);
      setError("Invalid email or password. Please Try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user) {
        const userDocRef = doc(db, "users", res.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await signOut(auth);
          router.push("/sign-up?need-sign-up=true");
        } else {
          router.push("/");
        }
      }
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setError(
          "Google sign in was cancelled. Please try again if you want to sign in with Google.",
        );
      } else {
        // Only log unexpected errors
        console.error("Google sign-in error: ", e);
        setError("Error with Google Sign In. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-2">
        <span className="text-[#00a6fb]">RateMyClub</span>
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign In</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-100 text-gray-900 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a6fb]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-100 text-gray-900 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a6fb]"
        />
        <button
          onClick={handleSignIn}
          className="w-full p-4 bg-[#00a6fb] text-white rounded-full hover:bg-blue-600 transition duration-300"
        >
          Sign In
        </button>
        <button
          onClick={handleGoogleSignIn}
          className="w-full p-4 mt-4 bg-[#4285F4] text-white rounded-full hover:bg-[#357ae8] transition duration-300"
        >
          Sign In with Google
        </button>
        <p className="text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-[#00a6fb] hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-gray-500 mt-2 text-center">
          <Link href="/" className="text-[#00a6fb] hover:underline">
            Return to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
