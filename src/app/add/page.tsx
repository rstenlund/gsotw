"use client";

import AccessGate from "@/components/AccessGate";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getSpotifyAccessToken, searchSpotifyTrack } from "@/lib/spotify";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function Add() {
  const supabase = createClient();
  const { user } = useUser();

  const [track, setTrack] = useState("");
  const [artist, setArtist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSearchResults(null);

    const track_s = track.trim();
    const artist_s = artist.trim();

    try {
      // Get Spotify access token
      const accessToken = await getSpotifyAccessToken();
      console.log("Successfully obtained Spotify access token");

      // Search for the track
      const results = await searchSpotifyTrack(track_s, artist_s, accessToken);
      setSearchResults(results);

      if (results.tracks?.items?.length > 0) {
        console.log("Found tracks:", results.tracks.items);
      } else {
        setError("No tracks found. Try a different search.");
      }
    } catch (err) {
      console.error("Spotify API error:", err);
      setError(err instanceof Error ? err.message : "Failed to search Spotify");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleClick(item: any) {
    const image_url = item.album.images[0]?.url || "";
    const spotify_url = item.external_urls.spotify || "";
    const track_name = item.name || "";
    const artist_name = item.artists.map((a: any) => a.name).join(", ") || "";

    // Get username from Clerk
    const username =
      user?.username ||
      user?.firstName ||
      user?.emailAddresses[0]?.emailAddress ||
      "Anonymous";
    const userId = user?.id;

    console.log("Adding song for user:", username, "ID:", userId);

    try {
      const { data, error } = await supabase.from("next").insert({
        image: image_url,
        spotify_url: spotify_url,
        track: track_name,
        artist: artist_name,
        user: username,
      });

      if (error) {
        console.error("Error adding song to database:", error);
        if (error.code === "23505") {
          setError("Du har redan lagt till en låt. Vänta tills nästa vecka!");
        } else {
          setError("Failed to add song to database");
        }
      } else {
        console.log("Successfully added song:", data);
        setSuccess(
          `✓ "${track_name}" av ${artist_name} har lagts till i utlottningen!`
        );
        setSearchResults(null);
        setTrack("");
        setArtist("");

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Error adding song to database:", error);
      setError("Failed to add song to database");
    }
  }

  return (
    <AccessGate>
      <div className="flex min-h-screen items-center justify-center font-sans gradient-bg dark:gradient-bg-dark relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>

        {/* Fixed UserButton in top right */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-4 animate-fade-in">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl px-16 relative z-10">
          <div className="flex flex-col items-center gap-8 text-center">
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
            <h1 className="text-3xl font-bold gradient-text mb-2 animate-fade-in-up delay-100">
              Lägg till låt i utlottningen
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md animate-fade-in-up delay-200">
              <div className="glass dark:glass-dark rounded-xl p-6 shadow-xl">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="track" className="sr-only">
                      Låt
                    </label>
                    <input
                      id="track"
                      type="text"
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      placeholder="Ange låt"
                      className="w-full px-5 py-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      required
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="artist" className="sr-only">
                      Artist
                    </label>
                    <input
                      id="artist"
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Ange artist"
                      className="w-full px-5 py-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-400/30 animate-fade-in">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 text-green-300 text-sm text-center font-medium bg-green-500/20 backdrop-blur-sm p-3 rounded-lg border border-green-400/30 animate-fade-in">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-5 py-4 px-6 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl ripple shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
                >
                  <span>{isLoading ? "Söker..." : "Sök 🔎"}</span>
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults && searchResults.tracks?.items?.length > 0 && (
              <div className="w-full max-w-2xl mt-8 animate-fade-in-up">
                <h2 className="text-2xl font-bold gradient-text mb-6">
                  Sökresultat:
                </h2>
                <div className="space-y-4 mb-10">
                  {searchResults.tracks.items.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className={`glass dark:glass-dark rounded-xl p-5 shadow-xl card-hover animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        {item.album?.images?.[2] && (
                          <img
                            src={item.album.images[2].url}
                            alt={item.album.name}
                            className="w-16 h-16 rounded-lg shadow-md"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-white text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-white/70">
                            {item.artists.map((a: any) => a.name).join(", ")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleClick(item)}
                          className="btn-gradient text-white font-semibold py-2 px-5 rounded-lg ripple shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                          <span>Lägg till</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AccessGate>
  );
}
