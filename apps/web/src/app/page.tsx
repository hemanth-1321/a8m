"use client";

import { TOKEN } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN);
    setToken(storedToken);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto absolute inset-0 h-full w-full">
        <div className="absolute inset-y-0 left-0 h-full w-px z-10 bg-gradient-to-b from-neutral-200/50 via-neutral-200 to-transparent dark:from-neutral-800/50 dark:via-neutral-700" />
        <div className="absolute inset-y-0 right-0 h-full w-px z-10 bg-gradient-to-b from-neutral-200/50 via-neutral-200 to-transparent dark:from-neutral-800/50 dark:via-neutral-700" />
      </div>

      <div className=" w-full h-px bg-gradient-to-r from-neutral-200/50 via-neutral-200 to-neutral-200/50 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-800 mb-4" />
      <div className="absolute bottom-120 w-full h-px bg-gradient-to-r from-neutral-200/50 via-neutral-200 to-neutral-200/50 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-800 mb-4" />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-start min-h-screen pt-20 sm:pt-28 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-7xl mx-auto">
          {/* Top Label */}
          <div className="mb-4 sm:mb-6">
            <span className="text-[#f17463] text-xs sm:text-sm font-medium tracking-wide uppercase">
              Automations for modern teams.
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-neutral-900 dark:text-white">
            Automate and orchestrate
            <br />
            workflows with <span className="text-[#f17463]">Automate A8n</span>
          </h1>

          {/* Subtitle */}
          <blockquote className="mt-6 mb-10 border-l-2 pl-6 italic text-neutral-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Build, connect, and automate your workflows visually with powerful
            AI-driven tools designed to save time and scale your productivity.
          </blockquote>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5 sm:mb-16 w-full sm:w-auto">
            {!token ? (
              <>
                <button
                  onClick={() => router.push("/auth")}
                  className="w-full sm:w-auto cursor-pointer text-black dark:text-neutral-900 bg-white hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-200 py-3 px-8 rounded-lg font-semibold text-base transition-all duration-300"
                >
                  Start automating
                </button>
                <button className="w-full sm:w-auto text-neutral-900 dark:text-white bg-transparent border border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 py-3 px-8 rounded-lg font-semibold text-base transition-all duration-300">
                  View pricing
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/home/workflows")}
                  className="w-full sm:w-auto cursor-pointer text-black dark:text-neutral-900 bg-white hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-200 py-3 px-8 rounded-lg font-semibold text-base transition-all duration-300"
                >
                  Go to Workflows
                </button>
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className="relative z-10 mt-2 rounded-3xl border border-neutral-200 bg-neutral-100 p-2 shadow-md dark:border-neutral-800 dark:bg-neutral-900 w-full max-w-6xl mx-auto"
          >
            <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="aspect-[16/9] h-auto w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
