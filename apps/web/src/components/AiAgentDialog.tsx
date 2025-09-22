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
import { toast } from "sonner";
import { useState } from "react";
import { Brain, Search } from "lucide-react"; // icons

interface AiAgentDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function AiAgentDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: AiAgentDialogProps) {
  const [agentName, setAgentName] = useState("");
  const [selectedLLM, setSelectedLLM] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");

  const llmProviders = [
    { id: "gemini", name: "Gemini" },
    { id: "groq", name: "Groq" },
    { id: "openai", name: "OpenAI" },
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleAddAgentNode = () => {
    if (!agentName.trim()) {
      toast.error("Agent name is required");
      return;
    }
    if (!selectedLLM) {
      toast.error("Select at least one LLM");
      return;
    }

    const agentNode = {
      id: `ai-agent-${Date.now()}`,
      name: agentName.trim(),
      type: "ai-agent",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      data: {
        agent_name: agentName.trim(),
        llm: selectedLLM,
        tools: selectedTools,
        prompt: systemPrompt.trim(),
      },
    };

    onAddNode(agentNode);
    resetForm();
  };

  const resetForm = () => {
    onOpenChange(false);
    setAgentName("");
    setSelectedLLM("");
    setSelectedTools([]);
    setSystemPrompt("");
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

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create AI Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Agent Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Agent Name *
            </label>
            <Input
              placeholder="Enter agent name (e.g., Research Bot)"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </div>

          {/* LLM Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Choose LLM *
            </label>
            <select
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select LLM</option>
              {llmProviders.map((llm) => (
                <option key={llm.id} value={llm.id}>
                  {llm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tool Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tools (optional)
            </label>
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              System Prompt
            </label>
            <Textarea
              placeholder="Define the behavior of the AI agent..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddAgentNode}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!agentName.trim() || !selectedLLM}
          >
            Save & Add Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
