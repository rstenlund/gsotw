"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const supabase = createClient();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState("/placeholder.png");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songUser, setSongUser] = useState("unknown");

  const router = useRouter();

  useEffect(() => {
    // Check if user has entered the access code
    const access = localStorage.getItem("gsotw_access");
    if (access === "granted") {
      setHasAccess(true);
    } else {
      router.push("/auth");
    }

    async function fetchData() {
      // Example: Fetch all songs
      const { data: songs, error } = await supabase
        .from("sotws")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching songs:", error);
      } else {
        //console.log("Fetched songs:", songs);
        const latestSong = songs?.[0];
        if (latestSong) {
          setImageUrl(latestSong.image);
          setRedirectUrl(latestSong.spotify_url);
          setSongTitle(latestSong.track);
          setArtistName(latestSong.artist);
          setSongUser(latestSong.user);
        }
      }
    }

    fetchData();
  }, [router]);

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg dark:gradient-bg-dark relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>

      {/* Fixed UserButton in top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4 animate-fade-in delay-100">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl px-16 relative z-10">

        <div className="flex flex-col items-center gap-6 text-center mt-10">
          {/* GSOTW Title */}
          <div className="animate-scale-in">
            <Image
              src="/GSOTW.svg"
              alt="GSOTW Logo"
              width={300}
              height={300}
              className="mb-6 select-none drop-shadow-2xl"
              priority
            />
          </div>

          {/* Centered Image with glass card */}
          <div className="mb-4 animate-fade-in-up delay-200">
            <div className="glass dark:glass-dark rounded-2xl p-6 shadow-2xl">
              <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src={imageUrl}
                  alt="GSOTW Album Cover"
                  width={300}
                  height={300}
                  className="rounded-xl cursor-pointer glow-hover"
                  priority
                />
              </a>
              <div className="mt-6 space-y-2">
                <p className="text-xl font-bold text-white bg-black/30 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                  {songTitle}
                </p>
                <p className="text-white/90 dark:text-white/80 text-lg">
                  {artistName}
                </p>
                <p className="text-white/70 dark:text-white/60 text-sm">
                  Tillagt av {songUser}
                </p>
              </div>
            </div>
          </div>

          {/* Two URL Links */}
          <div className="flex flex-row gap-4 items-center mb-0 mt-2 animate-fade-in-up delay-300">
            <Link
              href="/add"
              className="btn-gradient text-white text-lg font-semibold py-3 px-6 rounded-xl ripple shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <span>Lägg till låt</span>
            </Link>
            <Link
              href="/arkiv"
              className="btn-gradient text-white text-lg font-semibold py-3 px-6 rounded-xl ripple shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <span>Arkiv</span>
            </Link>
          </div>
          <div className="flex flex-row gap-4 items-center mt-0 mb-10 animate-fade-in-up delay-400">
            <Link
              href="/next"
              className="btn-gradient text-white text-lg font-semibold py-3 px-8 rounded-xl ripple shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all w-full"
            >
              <span>Nästa veckas urval</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
