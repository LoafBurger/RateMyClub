"use client";
// pages/admin-panel.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function AdminPanel() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/");  // Redirect if user is not logged in
        return;
      }
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role !== "admin") {
          router.push("/");  // Redirect if user is not an admin
        } else {
          setUserData(data);
        }
      }
    };
    checkAdminRole();
  }, [router]);

  if (!userData) {
    return <div>Loading...</div>; // Show loading state while checking the role
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome to the admin panel, {userData.email}!</p>
      {/* Add admin-specific functionality here */}
    </div>
  );
}

