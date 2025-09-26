"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowsTab from "@/components/WorkflowsTab";
import CredentialsTab from "@/components/CredentialsTab";
import { useAuthStore } from "@/store/authStore";

export default function OverviewPage() {
  const router = useRouter();
  const { token, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (token === null) {
      router.push("/auth");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-500 bg-white dark:bg-neutral-950">
      {/* Background borders */}
      <div className="max-w-6xl mx-auto absolute inset-0 h-full w-full pointer-events-none">
        <div className="absolute inset-y-0 left-0 h-full w-px z-10 bg-gradient-to-b from-neutral-200/50 via-neutral-200 to-transparent dark:from-neutral-800/50 dark:via-neutral-700" />
        <div className="absolute inset-y-0 right-0 h-full w-px z-10 bg-gradient-to-b from-neutral-200/50 via-neutral-200 to-transparent dark:from-neutral-800/50 dark:via-neutral-700" />
      </div>

      <div className="max-w-6xl mx-auto p-6 relative z-20">
        {/* Main Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Overview</h1>
          <p className="text-lg">
            Manage your workflows, credentials, and executions
          </p>
        </section>

        {/* Tabs */}
        <section>
          <Tabs defaultValue="workflows" className="space-y-6">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg p-1 bg-neutral-100 dark:bg-neutral-900">
              <TabsTrigger
                value="workflows"
                className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Workflows
              </TabsTrigger>
              <TabsTrigger
                value="credentials"
                className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Credentials
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="workflows"
              className="focus-visible:outline-none"
            >
              <WorkflowsTab />
            </TabsContent>

            <TabsContent
              value="credentials"
              className="focus-visible:outline-none"
            >
              <CredentialsTab />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
