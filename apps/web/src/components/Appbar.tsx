"use client";
import { TOKEN } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
export const Appbar = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { token, setToken, removeToken, loadToken } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    loadToken();
  }, [loadToken]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN);
    removeToken();
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-300">
      <div className="flex items-center justify-between py-4 px-4 max-w-6xl mx-auto">
        {/* Logo + Brand */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">A8M</span>
            </div>
            <h2 className="text-xl text-gray-800 font-bold tracking-tight">
              AutoMate
            </h2>
          </div>
        </Link>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {!mounted ? null : token ? (
            <button
              onClick={handleLogout}
              className="text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 px-4 rounded-lg font-bold shadow-lg tracking-wide transition-all duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              className="text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2 px-4 rounded-lg font-bold shadow-lg tracking-wide transition-all duration-200 transform hover:scale-105"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
