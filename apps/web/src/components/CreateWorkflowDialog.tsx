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
import { toast } from "sonner";
import { Plus, Loader2, Zap } from "lucide-react";

interface Props {
  onCreated: () => void; // callback to reload workflows
}

export default function CreateWorkflowDialog({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTitle(""); // reset form when dialog closes
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a workflow title");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.post(
        `${BACKEND_URL}/workflows/create`,
        { title: title.trim() }, // ✅ only sending title
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setTitle("");
        setOpen(false);

        toast.success("Workflow created successfully!", {
          description: `"${title.trim()}" is ready to use`,
          duration: 4000,
        });

        onCreated(); // refresh workflows
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
            disabled={loading || !title.trim()}
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
