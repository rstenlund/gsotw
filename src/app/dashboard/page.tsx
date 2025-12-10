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
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl px-16">
        {/* Header with logout */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          {/* GSOTW Title */}
          <Image
            src="/GSOTW.svg"
            alt="GSOTW Logo"
            width={300}
            height={300}
            className="mb-4 select-none"
            priority
          />

          {/* Centered Image */}
          <div className="mb-8">
            <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt="GSOTW Album Cover"
                width={300}
                height={300}
                className="rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                priority
              />
            </a>
            <p className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
              {songTitle}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              {artistName}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-0">
              Tillagt av {songUser}
            </p>
          </div>

          {/* Two URL Links */}
          <div className="flex flex-row gap-4 items-center mb-0">
            <Link
              href="/add"
              className="text-black dark:text-black hover:text-white text-lg transition-colors bg-zinc-300 hover:bg-green-700 font-medium py-2 px-4 rounded-lg"
            >
              Lägg till låt
            </Link>
            <Link
              href="/arkiv"
              className="text-black dark:text-black hover:text-white text-lg transition-colors bg-zinc-300 hover:bg-green-700 font-medium py-2 px-4 rounded-lg"
            >
              Arkiv
            </Link>
          </div>
          <div className="flex flex-row gap-4 items-center mt-0">
            <Link
              href="/next"
              className="text-black dark:text-black hover:text-white text-lg transition-colors bg-zinc-300 hover:bg-green-700 font-medium py-2 px-4 rounded-lg w-full"
            >
              Nästa veckas urval
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
