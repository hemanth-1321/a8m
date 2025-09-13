"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Switch } from "@radix-ui/react-switch";
import { toast } from "sonner";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { Workflow } from "@/lib/types";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";

export default function WorkflowsTab() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowToggles, setWorkflowToggles] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  // Load workflows
  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.get(`${BACKEND_URL}/workflows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setWorkflows(response.data.workflows);

        // Initialize toggle states
        const toggles: Record<string, boolean> = {};
        response.data.workflows.forEach(
          (w: Workflow) => (toggles[w.id] = false)
        );
        setWorkflowToggles(toggles);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load workflows");
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  // Handle workflow created
  const handleWorkflowCreated = () => {
    loadWorkflows();
  };

  // Handle workflow click
  const handleWorkflowClick = (workflow: Workflow) => {
    if (workflowToggles[workflow.id]) {
      router.push(`/workflow/${workflow.id}`);
    } else {
      toast.warning("Enable this workflow first", {
        description: `Toggle "${workflow.title}" to enable it`,
        duration: 3000,
      });
    }
  };

  // Handle toggle change
  const handleToggleChange = (workflowId: string, checked: boolean) => {
    setWorkflowToggles((prev) => ({ ...prev, [workflowId]: checked }));
    const workflow = workflows.find((w) => w.id === workflowId);
    if (checked) toast.success(`Workflow "${workflow?.title}" enabled`);
    else toast.info(`Workflow "${workflow?.title}" disabled`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Workflows</h2>
          <p className="text-slate-600">
            Manage and monitor your automated workflows
          </p>
        </div>
        <CreateWorkflowDialog onCreated={handleWorkflowCreated} />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              <p className="text-slate-600">Loading workflows...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={loadWorkflows}
              className="text-slate-600 hover:text-slate-900 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No workflows found
            </h3>
            <p className="text-slate-600 mb-4">
              Create your first workflow to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
                  workflowToggles[workflow.id]
                    ? "border-slate-200 bg-white shadow-sm"
                    : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <div
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => handleWorkflowClick(workflow)}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3
                        className={`font-semibold text-lg ${
                          workflowToggles[workflow.id]
                            ? "text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {workflow.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          workflowToggles[workflow.id]
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {workflowToggles[workflow.id] ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>Trigger: {workflow.trigger}</span>
                      <span>
                        Created:{" "}
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div className="ml-6 flex-shrink-0">
                    <Switch
                      checked={workflowToggles[workflow.id] || false}
                      onCheckedChange={(checked) =>
                        handleToggleChange(workflow.id, checked)
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        workflowToggles[workflow.id]
                          ? "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Enable workflow</span>
                      <span
                        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          workflowToggles[workflow.id]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
