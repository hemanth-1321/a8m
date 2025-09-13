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
    <div className="flex justify-center items-center min-h-screen p-8">
      <div className="w-full max-w-md p-8 shadow rounded">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignIn />
          </TabsContent>

          <TabsContent value="signup">
            {/* Pass a function to switch tab after successful signup */}
            <SignUp onSuccess={() => setActiveTab("signin")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
