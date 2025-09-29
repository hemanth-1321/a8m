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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface ManualTriggerDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function ManualTriggerDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: ManualTriggerDialogProps) {
  const [triggerName, setTriggerName] = useState("");
  const [description, setDescription] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Run Workflow");

  const handleAddManualTriggerNode = () => {
    if (!triggerName.trim()) {
      toast.error("Trigger name is required");
      return;
    }

    const manualTriggerNode = {
      id: `manual-trigger-${Date.now()}`,
      name: triggerName.trim(),
      type: "manual-trigger",
      icon: "Play",
      color: "from-purple-500 to-indigo-600",
      data: {
        trigger_name: triggerName.trim(),
        description: description.trim() || "Manual workflow trigger",
        button_label: buttonLabel.trim() || "Run Workflow",
      },
    };

    onAddNode(manualTriggerNode);
    resetForm();
  };

  const resetForm = () => {
    onOpenChange(false);
    setTriggerName("");
    setDescription("");
    setButtonLabel("Run Workflow");
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
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Manual Trigger Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Trigger Name *
            </label>
            <Input
              placeholder="Enter trigger name (e.g., Start Data Processing)"
              value={triggerName}
              onChange={(e) => setTriggerName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Description
            </label>
            <Textarea
              placeholder="Describe what this manual trigger does (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This description will help users understand the trigger's purpose
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Button Label
            </label>
            <Input
              placeholder="Run Workflow"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Text that will appear on the trigger button
            </p>
          </div>

          {triggerName && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 pointer-events-none"
                >
                  {buttonLabel.trim() || "Run Workflow"}
                </Button>
                <span className="text-xs text-gray-600">{triggerName}</span>
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  "{description}"
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddManualTriggerNode}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!triggerName.trim()}
          >
            Create Manual Trigger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
