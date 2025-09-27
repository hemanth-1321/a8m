"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/Signup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOKEN } from "@/lib/config";

const Page = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const t = localStorage.getItem(TOKEN);
    if (t) {
      router.push("/home/workflows");
    } else {
      setToken(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome
          </h1>
          <p className="text-gray-600 text-lg">
            {activeTab === "signin"
              ? "Sign in to your account"
              : "Create your account"}
          </p>
        </div>

        {/* Main card */}
        <div className=" backdrop-blur-xl border  shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-3xl">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6  rounded-xl p-1 h-12">
              <TabsTrigger
                value="signin"
                className="cursor-pointer rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="cursor-pointer rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <TabsContent
                value="signin"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="animate-in slide-in-from-right-5 duration-300">
                  <SignIn />
                </div>
              </TabsContent>

              <TabsContent
                value="signup"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="animate-in slide-in-from-left-5 duration-300">
                  <SignUp onSuccess={() => setActiveTab("signin")} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            {activeTab === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("signin")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
