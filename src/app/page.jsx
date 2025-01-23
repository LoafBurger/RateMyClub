"use client";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect } from "react";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  console.log(user);

  useEffect(() => {
    if (!user) {
      router.replace("/sign-up");
    }
  }, [user, router]); // Run this effect when `user` or `router` changes.

  if (!user) {
    // Optionally, you can return null or a loading spinner while the user is being redirected
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      RateMyClub :D
      <button onClick={() => signOut(auth)}>Log Out</button>
    </div>
  );
}
