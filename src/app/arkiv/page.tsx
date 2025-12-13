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
      <div className="flex min-h-screen items-center justify-center font-sans gradient-bg dark:gradient-bg-dark relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-10 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>

        {/* Fixed UserButton in top right */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-4 animate-fade-in">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-6xl px-6 relative z-10 py-20">
          <div className="flex flex-col items-center gap-6 text-center w-full">
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
              Arkiv
            </h1>

            {isLoading && (
              <div className="glass dark:glass-dark rounded-xl p-6 shadow-xl animate-fade-in">
                <div className="text-white/80 text-lg">Laddar arkiv...</div>
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
                    {songs.length} låtar i arkivet
                  </p>
                </div>
                <div className="space-y-4 mb-10">
                  {songs.map((song: any, index: number) => (
                    <div
                      key={song.id}
                      className="glass dark:glass-dark rounded-xl p-6 shadow-xl card-hover animate-fade-in-up"
                      style={{
                        animationDelay: `${Math.min(index * 0.05, 1)}s`,
                      }}
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

                          {song.created_at && (
                            <p className="text-xs text-white/60 bg-white/10 rounded-full px-3 py-1 inline-block">
                              Vecka {getWeekNumber(new Date(song.created_at))}
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
                          {song.user && (
                            <p className="text-xs text-white/60 bg-white/10 rounded-full px-3 py-1">
                              Tillagd av: {song.user}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && songs.length === 0 && !error && (
              <div className="glass dark:glass-dark rounded-xl p-8 shadow-xl animate-fade-in">
                <p className="text-white/80 text-lg">
                  Inga låtar i arkivet ännu
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
