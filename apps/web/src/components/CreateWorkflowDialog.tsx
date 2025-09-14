"use client";

import { useState } from "react";
import axios from "axios";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Zap, Clock, Webhook, Hand } from "lucide-react";

interface Props {
  onCreated: () => void; // callback to reload workflows
}

const triggerOptions = [
  {
    value: "Manual",
    label: "Manual",
    description: "Trigger manually when needed",
    icon: Hand,
  },
  {
    value: "Cron",
    label: "Scheduled",
    description: "Run on a schedule",
    icon: Clock,
  },
  {
    value: "Webhook",
    label: "Webhook",
    description: "Trigger via HTTP webhook",
    icon: Webhook,
  },
];

export default function CreateWorkflowDialog({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog closes
      setTitle("");
      setTrigger("");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a workflow title");
      return;
    }

    if (!trigger) {
      toast.error("Please select a trigger type");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.post(
        `${BACKEND_URL}/workflows/create`,
        { title: title.trim(), trigger },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response is successful (200-299 status code)
      if (response.status >= 200 && response.status < 300) {
        // Reset form and close dialog
        setTitle("");
        setTrigger("");
        setOpen(false);

        toast.success("Workflow created successfully!", {
          description: `"${title.trim()}" is ready to use`,
          duration: 4000,
        });

        // Call the callback to refresh workflows in parent component
        onCreated();
      }
    } catch (err: any) {
      console.error("Error creating workflow:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create workflow";
      toast.error("Creation failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTrigger = triggerOptions.find(
    (option) => option.value === trigger
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all duration-200 hover:shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Zap className="h-6 w-6 text-slate-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-slate-900">
            Create New Workflow
          </DialogTitle>
          <p className="text-center text-sm text-slate-600">
            Set up a new workflow to automate your processes
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-slate-700"
            >
              Workflow Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Data Processing Pipeline"
              className="transition-all duration-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              disabled={loading}
            />
          </div>

          {/* Trigger Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Trigger Type
            </Label>
            <Select
              value={trigger}
              onValueChange={setTrigger}
              disabled={loading}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                <SelectValue placeholder="Choose how to trigger this workflow">
                  {selectedTrigger && (
                    <div className="flex items-center space-x-2">
                      <selectedTrigger.icon className="h-4 w-4 text-slate-500" />
                      <span>{selectedTrigger.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer focus:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3 py-2">
                      <option.icon className="h-4 w-4 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-slate-500">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trigger description */}
            {selectedTrigger && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                {selectedTrigger.description}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex space-x-3 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim() || !trigger}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
