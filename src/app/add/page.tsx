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
      <div className="flex min-h-screen items-center justify-center font-sans bg-white dark:bg-black">
        <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-3xl px-16 bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-8 text-center">
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
            <h1 className="text-2xl font-regular text-gray-900 dark:text-white mb-2">
              Lägg till låt i utlottningen
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 dark:text-green-400 text-sm text-center font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? "Söker..." : "Sök 🔎"}
              </button>
            </form>

            {/* Search Results */}
            {searchResults && searchResults.tracks?.items?.length > 0 && (
              <div className="w-full max-w-2xl mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Sökresultat:
                </h2>
                <div className="space-y-3 mb-10">
                  {searchResults.tracks.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {item.album?.images?.[2] && (
                        <img
                          src={item.album.images[2].url}
                          alt={item.album.name}
                          className="w-16 h-16 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.artists.map((a: any) => a.name).join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleClick(item)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                      >
                        Lägg till
                      </button>
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
