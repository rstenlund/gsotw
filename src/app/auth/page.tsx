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
    <div className="flex min-h-screen items-center justify-center gradient-bg dark:gradient-bg-dark relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>

      <div className="w-full max-w-md p-8 space-y-8 relative z-10">
        <div className="text-center animate-scale-in">
          <h1 className="text-4xl font-bold gradient-text mb-3">
            GSOTW Access
          </h1>
          <p className="text-white/80 text-lg">
            Enter your access code to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 animate-fade-in-up delay-200"
        >
          <div className="glass dark:glass-dark rounded-xl p-6 shadow-2xl">
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
                className="w-full px-5 py-4 focus:outline-none rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-lg font-semibold tracking-wider"
                required
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="mt-4 text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-400/30 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full mt-5 py-4 px-6 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl ripple shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
            >
              <span>{isLoading ? "Verifying..." : "Access GSOTW"}</span>
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-white/60 bg-white/5 backdrop-blur-sm p-3 rounded-lg animate-fade-in delay-400">
          Don't have an access code? Contact the administrator.
        </div>
      </div>
    </div>
  );
}
