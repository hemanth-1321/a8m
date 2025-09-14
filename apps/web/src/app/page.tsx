"use client";

import { TOKEN } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN);
    setToken(storedToken);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      {/* Side Gradients */}
      <div className="max-w-6xl mx-auto absolute inset-0 h-full w-full">
        <div className="absolute inset-y-0 left-0 h-full w-px z-10 bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent" />
        <div className="absolute inset-y-0 right-0 h-full w-px z-10 bg-gradient-to-b from-neutral-300/50 via-neutral-200 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg sm:text-xl">
                A8M
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              AutoMate
            </h1>
          </div>

          {/* Hero Text */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-600 mb-6 leading-relaxed">
            Streamline your workflow with
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
              Intelligent Automation
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your business processes with our cutting-edge automation
            platform. Save time, reduce errors, and focus on what matters most.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!token ? (
              <button
                onClick={() => {
                  router.push("/auth");
                }}
                className="cursor-pointer w-full sm:w-auto text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-4 px-8 rounded-xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                Start Free Trial
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/home/workflows");
                }}
                className="cursor-pointer w-full sm:w-auto text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-4 px-8 rounded-xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                Workflows
              </button>
            )}
            {/* <button className="w-full sm:w-auto text-gray-700 bg-white border-2 border-gray-200 hover:border-purple-300 py-4 px-8 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                Watch Demo
              </button> */}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 text-sm">
                Process tasks in seconds, not hours
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                99.9% Reliable
              </h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade reliability you can trust
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure
              </h3>
              <p className="text-gray-600 text-sm">
                Bank-level security for your data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full blur-xl opacity-30 animate-pulse delay-1000"></div>
    </div>
  );
}
