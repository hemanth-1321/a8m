"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Brain, Search, Globe, FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

interface AgentNodeData {
  agent_name: string;
  llm: string;
  prompt: string;
  tools?: string[];
}

interface AgentNode {
  id: string;
  name: string;
  type: "action";
  icon: LucideIcon;
  color: string;
  data: AgentNodeData;
}

interface AiAgentDialogProps {
  provider: Provider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: AgentNode) => void;
}

export default function AiAgentDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: AiAgentDialogProps) {
  const [selectedLLM, setSelectedLLM] = useState<string>("");
  const [enableTools, setEnableTools] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  const llmProviders: Provider[] = [
    {
      id: "gemini",
      name: "Gemini",
      icon: Brain, // Replace with actual icon if different
    },
    {
      id: "groq",
      name: "Groq",
      icon: Brain,
    },
    {
      id: "openai",
      name: "OpenAI",
      icon: Brain,
    },
  ];

  const availableTools: Tool[] = [
    {
      id: "websearch",
      name: "Web Search",
      description: "Search the internet for information",
      icon: Search,
    },
    {
      id: "webscrape",
      name: "Web Scrape",
      description: "Extract data from web pages",
      icon: Globe,
    },
    {
      id: "summarizer",
      name: "Summarizer",
      description: "Summarize large text content",
      icon: FileText,
    },
  ];

  const handleAddAgentNode = () => {
    if (!selectedLLM) {
      toast.error("Select at least one LLM");
      return;
    }

    const agentNode: AgentNode = {
      id: `ai-agent-${Date.now()}`,
      name: "AI Agent",
      type: "action",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      data: {
        agent_name: "agent",
        llm: selectedLLM,
        prompt: systemPrompt.trim(),
        ...(enableTools && selectedTool ? { tools: [selectedTool] } : {}),
      },
    };

    onAddNode(agentNode);
    resetForm();

    const selectedLLMName = llmProviders.find(
      (llm) => llm.id === selectedLLM
    )?.name;
    toast.success(`AI Agent created with ${selectedLLMName}`);
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

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Create AI Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* LLM Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium">
              AI Model * (
              {llmProviders.filter((llm) => llm.id === selectedLLM).length > 0
                ? "1"
                : "0"}{" "}
              selected)
            </label>

            {llmProviders.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-muted-foreground">
                  No AI models available
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {llmProviders.map((llm) => (
                  <Card
                    key={llm.id}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedLLM === llm.id
                        ? "border-2 border-primary bg-primary/5"
                        : "border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedLLM(llm.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {llm.icon && <llm.icon />}
                          </span>
                          <div>
                            <h4 className="font-medium text-sm">{llm.name}</h4>
                          </div>
                        </div>
                        {selectedLLM === llm.id && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedLLM && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {llmProviders.find((llm) => llm.id === selectedLLM)?.name}{" "}
                  Selected
                </span>
              </div>
            )}
          </div>

          {/* Tools Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Agent Tools</Label>
              <Switch
                id="enableTools"
                checked={enableTools}
                onCheckedChange={setEnableTools}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {enableTools
                ? "Enable external tools for enhanced capabilities"
                : "Agent will use only its built-in knowledge"}
            </p>

            {enableTools && (
              <div className="space-y-3">
                {availableTools.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <p className="text-sm text-muted-foreground">
                      No tools available
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableTools.map((tool) => (
                      <Card
                        key={tool.id}
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          selectedTool === tool.id
                            ? "border-2 border-primary bg-primary/5"
                            : "border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <div className="flex items-center gap-3">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{tool.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                          {selectedTool === tool.id && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">
                                ✓
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedTool && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {
                        availableTools.find((tool) => tool.id === selectedTool)
                          ?.name
                      }{" "}
                      Enabled
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              System Prompt (Optional)
            </Label>
            <Textarea
              placeholder="Define the personality, behavior, and capabilities of your AI agent..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Define your agent's personality, role, and behavior. Leave empty
              for a general-purpose assistant.
            </p>
          </div>

          {/* Agent Summary */}
          {selectedLLM && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                AI Agent Configuration
              </span>
              <span className="text-sm text-muted-foreground">
                {llmProviders.find((llm) => llm.id === selectedLLM)?.name}
                {enableTools && selectedTool
                  ? ` + ${
                      availableTools.find((tool) => tool.id === selectedTool)
                        ?.name
                    }`
                  : ""}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button onClick={handleAddAgentNode} disabled={!selectedLLM}>
            Create Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
