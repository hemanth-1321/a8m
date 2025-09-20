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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface WebhookDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function WebhookDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: WebhookDialogProps) {
  const [webhookName, setWebhookName] = useState("");
  const [method, setMethod] = useState("POST");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleAddWebhookNode = () => {
    if (!webhookName.trim()) {
      toast.error("Webhook name is required");
      return;
    }

    if (!webhookUrl.trim()) {
      toast.error("Webhook URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const webhookNode = {
      id: `webhook-${Date.now()}`,
      name: webhookName.trim(),
      type: "webhook",
      icon: "Webhook",
      color: "from-green-500 to-emerald-600",
      data: {
        webhook_name: webhookName.trim(),
        method: method,
        url: webhookUrl.trim(),
      },
    };

    onAddNode(webhookNode);
    resetForm();
  };

  const resetForm = () => {
    onOpenChange(false);
    setWebhookName("");
    setMethod("POST");
    setWebhookUrl("");
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
          className="justify-start gap-2 mt-2 border-dashed border-green-300 text-green-600 hover:bg-green-50"
        >
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Webhook Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Webhook Name *
            </label>
            <Input
              placeholder="Enter webhook name (e.g., Payment Notification)"
              value={webhookName}
              onChange={(e) => setWebhookName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              HTTP Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Webhook URL *
            </label>
            <Input
              placeholder="https://api.example.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the full URL where the webhook will be sent
            </p>
          </div>

          {webhookName && webhookUrl && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
              <p className="text-xs text-gray-600">
                <span className="font-mono bg-white px-2 py-1 rounded">
                  {method}
                </span>{" "}
                request to{" "}
                <span className="font-mono bg-white px-2 py-1 rounded break-all">
                  {webhookUrl}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddWebhookNode}
            className="bg-green-600 hover:bg-green-700"
            disabled={!webhookName.trim() || !webhookUrl.trim()}
          >
            Create Webhook Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
