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
  Zap,
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
    toast.success("🎉 GitHub Webhook node created successfully!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildWebhookUrl());
    setCopied(true);
    toast.success("📋 Webhook URL copied to clipboard!");
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

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <Github className="h-8 w-8 text-purple-600" />
            🔗 GitHub Webhook Integration
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Automatically trigger your workflow when GitHub events occur in your
            repository
          </p>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Workflow Detection Status */}
          <Card
            className={`p-6 border-2 ${
              workflowId
                ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-red-300 bg-gradient-to-br from-red-50 to-pink-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  workflowId ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {workflowId ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    workflowId ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {workflowId
                    ? "✅ Workflow Detected"
                    : "⚠️ No Workflow Detected"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    workflowId ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {workflowId
                    ? "Great! We found your workflow ID in the current URL"
                    : "Please navigate to a workflow page to auto-detect the ID"}
                </p>
              </div>
            </div>

            {workflowId && (
              <div className="mt-4 p-4 bg-white/70 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Detected Workflow ID
                  </span>
                </div>
                <p className="text-sm font-mono bg-green-100 px-3 py-2 rounded border text-green-800">
                  {workflowId}
                </p>
              </div>
            )}
          </Card>

          {/* Webhook URL Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <Webhook className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Generated Webhook URL
              </h3>
            </div>

            <Card className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-800">
                      Webhook Endpoint
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={handleCopy}
                    className={`transition-all duration-200 ${
                      copied
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "hover:bg-purple-50 border-purple-200"
                    }`}
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

                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-inner">
                  <p className="text-sm font-mono text-gray-800 break-all leading-relaxed">
                    {buildWebhookUrl()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Secure HTTPS endpoint
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Automatic event processing
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Real-time workflow triggers
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    GitHub-compatible format
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Setup Instructions */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-full">📚</div>
                <h3 className="text-lg font-semibold text-indigo-800">
                  Setup Instructions
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">
                      Copy the webhook URL above
                    </span>{" "}
                    - it's automatically generated for your workflow
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">
                      Go to your GitHub repository
                    </span>{" "}
                    → Settings → Webhooks → Add webhook
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">Paste the URL</span> and
                    select events (push, pull request, etc.)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-sm text-indigo-700">
                    <span className="font-medium">Add this webhook node</span>{" "}
                    to complete the integration
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-3 pt-8 border-t">
          <Button
            variant="outline"
            onClick={resetForm}
            className="px-8 py-2 border-2 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddWebhookNode}
            disabled={!workflowId}
            className={`px-8 py-2 text-base font-medium shadow-lg transition-all duration-200 ${
              workflowId
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 shadow-purple-200"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {workflowId ? "🚀 Add GitHub Webhook" : "⚠️ Need Workflow ID"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
