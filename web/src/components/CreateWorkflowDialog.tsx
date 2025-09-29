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
import { Plus, Loader2, Zap, Sparkles, ArrowRight } from "lucide-react";

interface Props {
  onCreated: () => void;
}

export default function CreateWorkflowDialog({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTitle("");
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
        { title: title.trim() },
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

        onCreated();
      }
    } catch (err) {
      console.error("Error creating workflow:", err);

      toast.error("Creation failed", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && title.trim()) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Create Workflow</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-0 shadow-2xl  backdrop-blur-xl">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br  rounded-lg -z-10" />

        <DialogHeader className="space-y-6 pt-6">
          {/* Icon with Animation */}
          <div className="mx-auto relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
              <Zap className="h-8 w-8 text-slate-700" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold  tracking-tight">
              Create New Workflow
            </DialogTitle>
            <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
              Build powerful automation workflows to streamline your processes
              and boost productivity
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Enhanced Input Section */}
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-600" />
              Workflow Title
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Customer Onboarding Pipeline"
                className="h-12 text-base transition-all duration-300 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-white/80 backdrop-blur-sm shadow-sm"
                disabled={loading}
                maxLength={50}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="text-xs px-2 py-1 rounded-full">
                  {title.length}/50
                </span>
              </div>
            </div>
            {title.trim() && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 animate-fade-in">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Looks good! Ready to create
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Quick suggestions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Data Processing",
                "Email Automation",
                "File Management",
                "Report Generation",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTitle(suggestion + " Workflow")}
                  disabled={loading}
                  className="text-left p-3 text-sm cursor-pointer rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t border-slate-100/80">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1 h-11 border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="flex-1 h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span className="font-medium">Create Workflow</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
