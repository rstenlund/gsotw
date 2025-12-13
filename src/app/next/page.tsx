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
    <div className="flex min-h-screen items-center justify-center gradient-bg dark:gradient-bg-dark relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-10 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>

      {/* Fixed UserButton in top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4 animate-fade-in">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-6xl px-6 relative z-10 py-20">
        <div className="flex flex-col items-center gap-6 text-center w-full">
          {/* GSOTW Title */}
          <Link href="/" className="animate-scale-in">
            <Image
              src="/GSOTW.svg"
              alt="GSOTW Logo"
              width={300}
              height={300}
              className="mt-10 select-none drop-shadow-2xl hover:scale-105 transition-transform"
              priority
            />
          </Link>

          <h1 className="text-4xl font-bold text-white bg-black/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl inline-block mb-4 animate-fade-in-up delay-100">
            Nästa veckas urval
          </h1>

          {isLoading && (
            <div className="glass dark:glass-dark rounded-xl p-6 shadow-xl animate-fade-in">
              <div className="text-white/80 text-lg">Laddar låtar...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 text-red-300 animate-fade-in">
              {error}
            </div>
          )}

          {/* Songs List */}
          {!isLoading && songs.length > 0 && (
            <div className="w-full max-w-5xl mt-6 animate-fade-in-up delay-200">
              <div className="glass dark:glass-dark rounded-xl p-4 mb-6 shadow-lg">
                <p className="text-white/90 text-lg font-semibold">
                  {songs.length} tillagda låtar
                </p>
              </div>
              <div className="space-y-4 mb-10">
                {songs.map((song: any, index: number) => (
                  <div
                    key={song.id}
                    className="glass dark:glass-dark rounded-xl p-6 shadow-xl card-hover animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
                  >
                    <div className="flex items-center gap-4">
                      {song.image && (
                        <img
                          src={song.image}
                          alt={song.track}
                          className="w-20 h-20 rounded-lg shadow-lg"
                        />
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-white text-lg mb-1">
                          {song.track}
                        </h3>
                        <p className="text-white/80 mb-2">{song.artist}</p>
                        {song.user && (
                          <p className="text-xs text-white/60 bg-white/10 rounded-full px-3 py-1 inline-block">
                            Tillagd av: {song.user}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {song.spotify_url && (
                          <a
                            href={song.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gradient text-white font-semibold py-2 px-6 rounded-lg ripple shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            <span>Spotify</span>
                          </a>
                        )}

                        {song.user == user?.username && (
                          <button
                            onClick={() => {
                              handleRemove(song);
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-lg ripple shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            Ta bort
                          </button>
                        )}
                      </div>
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
