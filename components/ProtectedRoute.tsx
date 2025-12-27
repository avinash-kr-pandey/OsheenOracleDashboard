"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // ✅ derive state synchronously (NO setState)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isAuthenticated = Boolean(token);

  // ✅ effect ONLY for navigation (external system)
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or small loader if you want
  }

  return <>{children}</>;
}
