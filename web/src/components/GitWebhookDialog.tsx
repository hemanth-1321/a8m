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
import { Card } from "@/components/ui/card";
import {
  Github,
  Copy,
  CheckCircle,
  AlertCircle,
  Webhook,
  GitBranch,
} from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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
    toast.success("GitHub Webhook node created successfully!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildWebhookUrl());
    setCopied(true);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    onOpenChange(false);
    setCopied(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-start gap-2 mt-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Github className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Github className="h-5 w-5" />
            Create GitHub Webhook
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Automatically trigger your workflow when GitHub events occur in your
            repository
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Webhook URL Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Generated Webhook URL</label>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Webhook Endpoint
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={handleCopy}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded border font-mono text-sm break-all">
                  {buildWebhookUrl()}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Secure HTTPS endpoint
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Automatic event processing
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Real-time workflow triggers
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    GitHub-compatible format
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Setup Instructions</label>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">
                      Copy the webhook URL above
                    </span>{" "}
                    - it's automatically generated for your workflow
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">
                      Go to your GitHub repository
                    </span>{" "}
                    → Settings → Webhooks → Add webhook
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Paste the URL</span> and
                    select events (push, pull request, etc.)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Add this webhook node</span>{" "}
                    to complete the integration
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Configuration Summary */}
          {workflowId && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                GitHub Webhook Configuration
              </span>
              <span className="text-sm text-muted-foreground">
                Ready to integrate with workflow {workflowId.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button onClick={handleAddWebhookNode} disabled={!workflowId}>
            Add GitHub Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
