"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

interface GitWebhookDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function GitWebhookDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: GitWebhookDialogProps) {
  const [workflowId, setWorkflowId] = useState("");
  const webhookBaseUrl = `${BACKEND_URL}/webhook`;

  // Extract workflow ID from current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Extract workflow ID from URL pattern: /workflow/{workflowId}
      const match = currentPath.match(/\/workflow\/([a-f0-9-]+)/);
      if (match && match[1]) {
        setWorkflowId(match[1]);
      }
    }
  }, []);

  const buildWebhookUrl = () => {
    if (!workflowId) return webhookBaseUrl;
    return `${webhookBaseUrl}/${workflowId}`;
  };

  const handleAddWebhookNode = () => {
    const fullUrl = buildWebhookUrl();
    const webhookNode = {
      id: `github-webhook-${Date.now()}`,
      name: "GitHub Webhook",
      type: "action",
      icon: "Github",
      color: "from-purple-500 to-pink-600",
      data: {
        webhook_url: fullUrl,
        workflow_id: workflowId,
      },
    };

    onAddNode(webhookNode);
    onOpenChange(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildWebhookUrl());
    toast.success("Webhook URL copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-start gap-2 mt-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Github className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>GitHub Webhook Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="p-3 bg-blue-50 rounded-md">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Detected Workflow ID
            </label>
            <p className="text-sm font-mono text-blue-800 bg-white px-2 py-1 rounded border">
              {workflowId || "No workflow ID detected"}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
            <div className="flex-1 mr-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Generated Webhook URL
              </label>
              <p className="text-xs text-gray-800 break-all font-mono">
                {buildWebhookUrl()}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddWebhookNode}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!workflowId}
          >
            Add GitHub Webhook Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
