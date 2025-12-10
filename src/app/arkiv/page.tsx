"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import AccessGate from "../../components/AccessGate";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

// Helper function to get ISO week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function Arkiv() {
  const supabase = createClient();
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArchive() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("sotws")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching archive:", error);
          setError("Failed to load archive");
          return;
        }

        //console.log("Fetched archive data:", data);
        setSongs(data || []);
      } catch (error) {
        console.error("Error fetching archive:", error);
        setError("Failed to load archive");
      } finally {
        setIsLoading(false);
      }
    }

    fetchArchive();
  }, []);

  return (
    <AccessGate>
      <div className="flex min-h-screen items-center justify-center font-sans bg-white dark:bg-black">
        <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-6xl px-6 bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-4 text-center w-full">
            <SignedIn>
              <div className="absolute top-4 right-4">
                <UserButton />
              </div>
            </SignedIn>

            <Link href="/">
              <Image
                src="/GSOTW.svg"
                alt="GSOTW Logo"
                width={300}
                height={300}
                className=" mt-10 select-none"
                priority
              />
            </Link>

            <h1 className="text-3xl font-regular text-gray-900 dark:text-white mb-2">
              Arkiv
            </h1>

            {isLoading && (
              <div className="text-gray-600 dark:text-gray-400">
                Laddar arkiv...
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Songs List */}
            {!isLoading && songs.length > 0 && (
              <div className="w-full max-w-5xl mt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {songs.length} låtar i arkivet
                </p>
                <div className="space-y-3 mb-10">
                  {songs.map((song: any) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {song.image && (
                        <img
                          src={song.image}
                          alt={song.track}
                          className="w-16 h-16 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {song.track}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {song.artist}
                        </p>

                        {song.created_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Vecka {getWeekNumber(new Date(song.created_at))}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {song.spotify_url && (
                          <a
                            href={song.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                          >
                            Spotify
                          </a>
                        )}
                        {song.user && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tillagd av: {song.user}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && songs.length === 0 && !error && (
              <div className="text-gray-600 dark:text-gray-400">
                Inga låtar i arkivet ännu
              </div>
            )}
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
