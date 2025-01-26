"use client";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //To show validation or API errors
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth); //return array
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-white text-4xl font-bold mb-10">RateMyClub</h1>
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign Up
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-indigo-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
