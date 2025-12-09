/**
 * Get Spotify Access Token using Client Credentials Flow
 * This is suitable for server-side or background operations
 * For user-specific data, you'd need the Authorization Code Flow instead
 */

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function getSpotifyAccessToken(): Promise<string> {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Spotify client credentials are not configured");
  }

  // Encode credentials in base64
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get Spotify access token: ${
        error.error_description || error.error
      }`
    );
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotifyTrack(
  track: string,
  artist: string,
  accessToken: string
) {
  const limit = 5;
  const query = encodeURIComponent(`track:${track} artist:${artist}`);

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Spotify search failed: ${error.error?.message || "Unknown error"}`
    );
  }

  return response.json();
}

/**
 * Get track details by Spotify ID
 */
export async function getSpotifyTrack(trackId: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get track: ${error.error?.message || "Unknown error"}`
    );
  }

  return response.json();
}
