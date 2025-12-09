"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AccessGateProps {
  children: React.ReactNode;
}

export default function AccessGate({ children }: AccessGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("gsotw_access");
    if (access === "granted") {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      router.push("/auth");
    }
  }, [router]);

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (hasAccess === false) {
    return null; // Will redirect to /auth
  }

  return <>{children}</>;
}
