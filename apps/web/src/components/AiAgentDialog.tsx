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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { Brain, Zap, Search, Globe, FileText, Sparkles } from "lucide-react";

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
  const [selectedLLM, setSelectedLLM] = useState("");
  const [enableTools, setEnableTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const llmProviders = [
    {
      id: "gemini",
      name: "Gemini",
      description: "Google's advanced multimodal AI",
      icon: "💎",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "groq",
      name: "Groq",
      description: "Ultra-fast inference engine",
      icon: "⚡",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT-powered intelligence",
      icon: "🤖",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const availableTools = [
    {
      id: "websearch",
      name: "Web Search",
      description: "Search the internet for information",
      icon: Search,
      color: "text-blue-600",
    },
    {
      id: "webscrape",
      name: "Web Scrape",
      description: "Extract data from web pages",
      icon: Globe,
      color: "text-green-600",
    },
    {
      id: "summarizer",
      name: "Summarizer",
      description: "Summarize large text content",
      icon: FileText,
      color: "text-purple-600",
    },
  ];

  const getSelectedLLMDetails = () => {
    return llmProviders.find((llm) => llm.id === selectedLLM);
  };

  const getSelectedToolDetails = () => {
    return availableTools.find((tool) => tool.id === selectedTool);
  };

  const handleAddAgentNode = () => {
    if (!selectedLLM) {
      toast.error("Select at least one LLM");
      return;
    }

    const agentNode: any = {
      id: `ai-agent-${Date.now()}`,
      name: "AI Agent",
      type: "action",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      data: {
        agent_name: "agent",
        llm: selectedLLM,
        prompt: systemPrompt.trim(),
      },
    };

    if (enableTools && selectedTool) {
      agentNode.data.tools = [selectedTool];
    }

    onAddNode(agentNode);
    resetForm();
    toast.success(
      `🤖 AI Agent created successfully with ${getSelectedLLMDetails()?.name}!`
    );
  };

  const resetForm = () => {
    onOpenChange(false);
    setSelectedLLM("");
    setEnableTools(false);
    setSelectedTool("");
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

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            🤖 Create AI Agent
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Configure your intelligent AI agent with custom models, tools, and
            behavioral instructions
          </p>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* LLM Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                🧠
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Choose AI Model
              </h3>
              <span className="text-red-500 font-medium">*</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {llmProviders.map((llm) => (
                <Card
                  key={llm.id}
                  className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                    selectedLLM === llm.id
                      ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105"
                      : "border-gray-200 hover:border-purple-200 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedLLM(llm.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{llm.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {llm.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {llm.description}
                          </p>
                        </div>
                      </div>
                      {selectedLLM === llm.id && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${llm.color} opacity-60`}
                    ></div>

                    {selectedLLM === llm.id && (
                      <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded animate-in slide-in-from-top duration-200">
                        🎯 Selected as your AI brain
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {selectedLLM && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">
                    {getSelectedLLMDetails()?.name} Ready!
                  </span>
                  <span className="text-purple-600">
                    {getSelectedLLMDetails()?.description}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Tools Section */}
          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                enableTools
                  ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full transition-colors ${
                      enableTools ? "bg-indigo-100" : "bg-gray-100"
                    }`}
                  >
                    {enableTools ? "🔧" : "🛠️"}
                  </div>
                  <div>
                    <Label
                      className={`text-lg font-semibold ${
                        enableTools ? "text-indigo-800" : "text-gray-700"
                      }`}
                    >
                      Agent Tools
                    </Label>
                    <p
                      className={`text-sm mt-1 ${
                        enableTools ? "text-indigo-600" : "text-gray-500"
                      }`}
                    >
                      {enableTools
                        ? "🚀 Tools enabled - your agent can use external capabilities"
                        : "💭 Pure conversation mode - agent uses only its knowledge"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableTools"
                  checked={enableTools}
                  onCheckedChange={setEnableTools}
                  className="data-[state=checked]:bg-indigo-500"
                />
              </div>

              {enableTools && (
                <div className="space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableTools.map((tool) => (
                      <Card
                        key={tool.id}
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          selectedTool === tool.id
                            ? "border-2 border-indigo-400 bg-white shadow-md scale-105"
                            : "border border-gray-200 hover:border-indigo-200 bg-white hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <div className="flex items-center gap-3">
                          <tool.icon className={`h-5 w-5 ${tool.color}`} />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800 text-sm">
                              {tool.name}
                            </h5>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                          {selectedTool === tool.id && (
                            <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {selectedTool && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 animate-in slide-in-from-top duration-200">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium text-indigo-800 text-sm">
                          {getSelectedToolDetails()?.name} activated!
                        </span>
                        <span className="text-indigo-600 text-sm">
                          {getSelectedToolDetails()?.description}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System Prompt Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                📝
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Agent Instructions
              </h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                System Prompt (Optional)
              </Label>
              <Textarea
                placeholder="Define the personality, behavior, and capabilities of your AI agent...

Example:
You are a helpful customer service agent. Be friendly, professional, and always try to solve the customer's problem. If you can't help, escalate to a human agent."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[120px] text-base p-4 border-2 border-gray-200 focus:border-pink-400 focus:ring-pink-400 resize-none"
                rows={6}
              />
              <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <p className="text-xs text-pink-700 flex items-center gap-2">
                  <span>💡</span>
                  Define your agent's personality, role, and behavior. Leave
                  empty for a general-purpose assistant.
                </p>
              </div>
            </div>
          </div>
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
            onClick={handleAddAgentNode}
            disabled={!selectedLLM}
            className={`px-8 py-2 text-base font-medium shadow-lg transition-all duration-200 ${
              selectedLLM
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 shadow-purple-200"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {selectedLLM ? "🚀 Create AI Agent" : "⚠️ Select LLM First"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
