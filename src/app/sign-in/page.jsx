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
      <h1 className="text-white text-4xl font-bold mb-10">RateMyClub</h1>
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign In</h1>
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
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign In
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-indigo-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
