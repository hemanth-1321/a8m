"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Github, Zap, Workflow, Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { providers } from "@/lib/actionProviders";
import FormDialog from "./FormDialog";
import WebhookDialog from "./WebhookDialog";
import ManualTriggerDialog from "./ManualTriggerDialog";
import EmailDialog from "./EmailDialog";
import AiAgentDialog from "./AiAgentDialog";
import GitWebhookDialog from "./GitWebhookDialog";

interface SidebarProps {
  onAddNode: (node: any) => void;
  onAddEdge?: (edge: any) => void;
  nodes?: any[];
}

export default function Sidebar({
  onAddNode,
  onAddEdge,
  nodes = [],
}: SidebarProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [manualTriggerDialogOpen, setManualTriggerDialogOpen] = useState(false);
  const [aiAgentDialogOpen, setAiAgentDialogOpen] = useState(false);
  const [gitWebhookDialogOpen, setGitWebhookDialogOpen] = useState(false);

  const handleAddNode = (node: any) => {
    onAddNode(node);
    toast.success(`${node.name} node added successfully!`);
  };

  // Exclude Gmail + AI Agent from normal providers
  const visibleProviders = providers.filter(
    (p) => !p.hidden && !["gmail", "ai-agent"].includes(p.id)
  );

  const triggerTypes = visibleProviders.filter((p) =>
    ["manual-trigger", "form", "webhook"].includes(p.id)
  );
  const otherProviders = visibleProviders.filter(
    (p) =>
      !["manual-trigger", "form", "webhook", "gmail", "github"].includes(p.id)
  );

  const renderProviderButton = (provider: any) => {
    if (provider.id === "form") {
      return (
        <FormDialog
          key={provider.id}
          provider={provider}
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          onAddNode={handleAddNode}
        />
      );
    }

    if (provider.id === "webhook") {
      return (
        <WebhookDialog
          key={provider.id}
          provider={provider}
          open={webhookDialogOpen}
          onOpenChange={setWebhookDialogOpen}
          onAddNode={handleAddNode}
        />
      );
    }

    if (provider.id === "manual-trigger") {
      return (
        <ManualTriggerDialog
          key={provider.id}
          provider={provider}
          open={manualTriggerDialogOpen}
          onOpenChange={setManualTriggerDialogOpen}
          onAddNode={handleAddNode}
        />
      );
    }

    return (
      <Button
        key={provider.id}
        variant="outline"
        className="group justify-start gap-3 w-full h-14 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md relative overflow-hidden"
        onClick={() => setSelected(provider)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-200">
          <provider.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
        </div>
        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
          {provider.name}
        </span>
      </Button>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="relative h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl group"
        >
          <div className="absolute inset-0 bg-white opacity-20 rounded-2xl group-hover:opacity-30 transition-opacity duration-200" />
          <Plus size={24} className="relative z-10" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-80 sm:w-96 bg-gradient-to-b from-gray-50 to-white border-l-2 border-gray-200"
      >
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Nodes
          </SheetTitle>
          <p className="text-sm text-gray-600 mt-1">
            Build your automation workflow
          </p>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6 h-full overflow-y-auto pb-4">
          {/* Trigger types */}
          {nodes.length === 0 && triggerTypes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Triggers
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
              </div>
              <div className="grid gap-3">
                {triggerTypes.map(renderProviderButton)}
              </div>
            </div>
          )}

          {/* Integrations: Gmail + AI Agent */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Integrations
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
            </div>
            <div className="grid gap-3">
              <div className="relative group">
                <EmailDialog
                  provider={providers.find((p) => p.id === "gmail")}
                  open={emailDialogOpen}
                  onOpenChange={setEmailDialogOpen}
                  onAddNode={handleAddNode}
                />
              </div>

              <div className="relative group">
                <AiAgentDialog
                  provider={providers.find((p) => p.id === "ai-agent")}
                  open={aiAgentDialogOpen}
                  onOpenChange={setAiAgentDialogOpen}
                  onAddNode={handleAddNode}
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <GitWebhookDialog
              provider={{ name: "GitHub Webhook" }}
              open={gitWebhookDialogOpen}
              onOpenChange={setGitWebhookDialogOpen}
              onAddNode={handleAddNode}
            />
          </div>

          {/* Other providers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                <Workflow className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {nodes.length === 0 ? "Actions" : "Add Nodes"}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
            </div>
            <div className="grid gap-3">
              {otherProviders.map(renderProviderButton)}
            </div>

            {selected && (
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <selected.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {selected.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ready to add to workflow
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => {
                    onAddNode(selected);
                    setSelected(null);
                    toast.success(`${selected.name} node added!`);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add {selected.name} Node
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
