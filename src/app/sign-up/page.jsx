"use client";
import { useState, useEffect } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db, googleProvider } from "@/app/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPopup, signOut } from "firebase/auth";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //To show validation or API errors
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth); //return array
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If user needs to sign up, make sure they're signed out
    const needSignUp = searchParams.get("need-sign-up");
    if (needSignUp === "true") {
      signOut(auth);
    }
  }, [searchParams]);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      if (res?.user) {
        const userDoc = doc(db, "users", res.user.uid);
        await setDoc(userDoc, {
          uid: res.user.uid,
          email: res.user.email,
          createdAt: new Date().toISOString(),
        });

        console.log("User saved to Firestore: ", res.user);
        setEmail("");
        setPassword("");
        setError("");
        router.push("/sign-in"); //redirect to sign-in page
      }
    } catch (e) {
      console.log(e);
      //handle firebase errors
      if (e.code == "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use a different email or sign in.",
        );
      } else {
        setError("Error creating account. Please try again.");
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user) {
        const userDoc = doc(db, "users", res.user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {  //if the account already exists
          await signOut(auth);
          setError(
            "This Google account is already registered. Please sign in instead.",
          );
          return;
        }

        await setDoc(userDoc, {
          uid: res.user.uid,
          email: res.user.email,
          createdAt: new Date().toISOString(),
        });

        router.push("/");
      }
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        // Don't log this error since it's an expected user action
        setError(
          "Google sign up was cancelled. Please try again if you want to sign up with Google.",
        );
      } else {
        // Only log unexpected errors
        console.error("Google sign up error:", e);
        setError("Error with Google Sign Up. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-white text-4xl font-bold mb-8 flex items-center gap-2">
        <span className="text-[#00a6fb]">RateMyClub</span>
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sign Up</h1>
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
          onClick={handleSignUp}
          className="w-full p-4 bg-[#00a6fb] text-white rounded-full hover:bg-blue-600 transition duration-300"
        >
          Sign Up
        </button>
        {/* Google Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          className="w-full mt-4 p-4 bg-blue-600 text-white rounded-full flex items-center justify-center gap-2 hover:bg-blue-950 transition duration-300"
        >
          <img
            className="w-6 h-6"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            loading="lazy"
            alt="google logo"
          />
          <span>Sign Up with Google</span>
        </button>
        <p className="text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#00a6fb] hover:underline">
            Sign In
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

export default SignUp;
