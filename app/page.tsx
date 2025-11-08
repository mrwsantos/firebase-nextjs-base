'use client'

// import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  // const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
  }, [ router]);

  return (
    <div className="flex flex-col gap-5 min-h-screen w-full justify-center items-center">
      <h1 className="font-bold text-4xl text-primary">INITIAL PAGE</h1>
      <p>Welcome</p>
    </div>
  );
}
