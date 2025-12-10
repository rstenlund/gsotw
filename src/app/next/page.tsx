"use client";

import { createClient } from "@/lib/supabase/client";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { set } from "better-auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NextPage() {
  const supabase = createClient();
  const { user } = useUser();

  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(song: any) {
    console.log("Removing song with ID:", song.id);

    try {
      setIsLoading(true);
      const { error } = await supabase.from("next").delete().eq("id", song.id);
      if (error) {
        console.error("Error removing song:", error);
        setError("Failed to remove song");
      } else {
        console.log("Song removed successfully");
        // Refresh the song list after removal
        fetchNextSong();
      }
    } catch (error) {
      console.error("Error removing song:", error);
      setError("Failed to remove song");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchNextSong() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("next")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching next song:", error);
        return;
      }

      setSongs(data || []);
      //console.log("Fetched next song data:", data);
    } catch (error) {
      console.error("Error fetching next song:", error);
      setError("Failed to load next song");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNextSong();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-6xl px-6 bg-white dark:bg-black">
        {/* Header with logout */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          {/* GSOTW Title */}
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

          <h1 className="text-2xl font-regular text-gray-900 dark:text-white mb-2">
            Nästa veckas urval
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
            <div className="w-full max-w-4xl mt-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {songs.length} tillagda låtar
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
                      {song.user && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Tillagd av: {song.user}
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

                      {song.user == user?.username && (
                        <button
                          onClick={() => {
                            handleRemove(song);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
