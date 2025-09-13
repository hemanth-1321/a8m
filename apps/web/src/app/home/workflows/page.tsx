"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import WorkflowsTab from "@/components/WorkflowsTab";
import CredentialsTab from "@/components/CredentialsTab";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "credentials">(
    "workflows"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Main Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Overview
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your workflows, credentials, and executions
          </p>
        </section>

        {/* Tabs */}
        <section>
          <Tabs
            defaultValue="workflows"
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "workflows" | "credentials")
            }
            className="space-y-6"
          >
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1">
              <TabsTrigger
                value="workflows"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                Workflows
              </TabsTrigger>
              <TabsTrigger
                value="credentials"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
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
