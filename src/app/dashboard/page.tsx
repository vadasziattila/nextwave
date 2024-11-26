"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    router.replace('/login'); // Redirect to login after rendering
  }, [router]);
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <h1>Welcome !</h1>
    </div>
  );
}
