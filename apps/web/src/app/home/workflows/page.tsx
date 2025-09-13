"use client";

import { Button } from "@/components/ui/button";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { Workflow } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Pages = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const loadWorkflows = async () => {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.get(`${BACKEND_URL}/workflows`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      if (response.data) {
        setWorkflows(response.data.workflows);
      }
      setLoading(false);
    };

    loadWorkflows();
  }, []);
  const handleWorkflowClick = (id: string) => {
    router.push(`/workflow/${id}`);
  };
  return (
    <div className="w-full min-h-screen flex justify-center">
      <div className="max-w-6xl w-full p-8 rounded shadow">
        <section className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Overview</h1>
            <p className="text-lg text-gray-700">
              All the workflows, credentials, and executions you have access to
            </p>
          </div>
          <Button>Create Workflow</Button>
        </section>

        <section className="mt-10">
          <div className="flex w-full  flex-col gap-4">
            <Tabs defaultValue="workflows">
              <TabsList className="flex space-x-4 border-b border-gray-300 mb-4">
                <TabsTrigger
                  value="workflows"
                  className="px-4 py-2 text-sm font-medium"
                >
                  Workflows
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="px-4 py-2 text-sm font-medium"
                >
                  Credentials
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workflows">
                {loading ? (
                  <p className="text-gray-500">Loading workflows...</p>
                ) : error ? (
                  <p className="text-red-500">Error: {error}</p>
                ) : workflows.length === 0 ? (
                  <p className="text-gray-600">No workflows found.</p>
                ) : (
                  <ul className="space-y-3">
                    {workflows.map((workflow) => (
                      <li
                        key={workflow.id}
                        className="p-4 bg-gray-50 rounded shadow-sm border cursor-pointer"
                        onClick={() => handleWorkflowClick(workflow.id)}
                      >
                        <h3 className="font-semibold text-gray-800">
                          {workflow.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Trigger: {workflow.trigger}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Created:{" "}
                          {new Date(workflow.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="password">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p>Update your password securely here.</p>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pages;
