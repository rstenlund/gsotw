"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "dotenv/config";

const ACCESS_CODE = process.env.NEXT_PUBLIC_PASSCODE; // Change this to your desired code

export default function AuthGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (code.toUpperCase() === ACCESS_CODE) {
      // Store access in localStorage or session
      localStorage.setItem("gsotw_access", "granted");
      router.push("/dashboard"); // Redirect to protected area
    } else {
      setError("Invalid access code. Please try again.");
      setCode("");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GSOTW Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your access code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="sr-only">
              Access Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Verifying..." : "Access GSOTW"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an access code? Contact the administrator.
        </div>
      </div>
    </div>
  );
}
