"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Switch } from "@radix-ui/react-switch";
import { toast } from "sonner";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { Workflow } from "@/lib/types";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";
import { Trash2, Zap, Calendar, Play, Pause, Plus } from "lucide-react";

export default function WorkflowsTab() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowToggles, setWorkflowToggles] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.get(`${BACKEND_URL}/workflows/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const workflowsData: Workflow[] = response.data.data || [];
      setWorkflows(workflowsData);

      // Initialize toggle states
      const toggles: Record<string, boolean> = {};
      workflowsData.forEach((w: Workflow) => (toggles[w.id] = true));
      setWorkflowToggles(toggles);

      setError(null);
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

  const handleWorkflowCreated = () => {
    loadWorkflows();
  };

  const handleDeleteWorkflow = async (id: string) => {
    const token = localStorage.getItem(TOKEN);
    setLoading(true);

    try {
      await axios.delete(`${BACKEND_URL}/workflows/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Workflow deleted successfully");
      await loadWorkflows();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete workflow");
      setLoading(false);
    }
  };

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

  const handleToggleChange = (workflowId: string, checked: boolean) => {
    setWorkflowToggles((prev) => ({ ...prev, [workflowId]: checked }));
    const workflow = workflows.find((w) => w.id === workflowId);
    if (checked) toast.success(`Workflow "${workflow?.title}" enabled`);
    else toast.info(`Workflow "${workflow?.title}" disabled`);
  };

  // Calculate stats
  const activeWorkflows = workflows.filter((w) => workflowToggles[w.id]).length;
  const totalWorkflows = workflows.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Workflows</h2>
          <p className="text-muted-foreground">
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
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading workflows...</p>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workflow to automate your processes and boost
              productivity
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => handleWorkflowClick(workflow)}
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold capitalize">
                          {workflow.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            workflowToggles[workflow.id]
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {workflowToggles[workflow.id] ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Trigger: {workflow.trigger}</span>
                        <span>
                          Created:{" "}
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Toggle Switch */}
                    <Switch
                      checked={workflowToggles[workflow.id] || false}
                      onCheckedChange={(checked) =>
                        handleToggleChange(workflow.id, checked)
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        workflowToggles[workflow.id]
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Enable workflow</span>
                      <span
                        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-background shadow transition duration-200 ${
                          workflowToggles[workflow.id]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </Switch>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(workflow.id);
                      }}
                      className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
