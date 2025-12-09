"use client";

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessGate from "../components/AccessGate";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <AccessGate>
      <div className="flex min-h-screen items-center justify-center font-sans bg-white dark:bg-black">
        <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl px-16 bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-8 text-center">
            <SignedIn>
              <div className="absolute top-4 right-4">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
