"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //To show validation or API errors
  //test account, testtest123
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter(); //reroute user after sign-in

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
