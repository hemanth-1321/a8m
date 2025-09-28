"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Plus,
  Github,
  Zap,
  Workflow,
  Bot,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { providers } from "@/lib/actionProviders";
import FormDialog from "./FormDialog";
import WebhookDialog from "./WebhookDialog";
import ManualTriggerDialog from "./ManualTriggerDialog";
import EmailDialog from "./EmailDialog";
import AiAgentDialog from "./AiAgentDialog";
import GitWebhookDialog from "./GitWebhookDialog";
import TelegramDialog from "./TelegramDialog";

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
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);

  const handleAddNode = (node: any) => {
    onAddNode(node);
    toast.success(`${node.name} node added successfully!`);
  };

  // Exclude Gmail + AI Agent + Telegram from normal providers
  const visibleProviders = providers.filter(
    (p) => !p.hidden && !["gmail", "ai-agent", "telegram"].includes(p.id)
  );

  const triggerTypes = visibleProviders.filter((p) =>
    ["manual-trigger", "form", "webhook"].includes(p.id)
  );
  const otherProviders = visibleProviders.filter(
    (p) =>
      ![
        "manual-trigger",
        "form",
        "webhook",
        "gmail",
        "github",
        "telegram",
      ].includes(p.id)
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
        className="justify-start gap-3 w-full h-12 text-left font-medium hover:bg-accent transition-colors"
        onClick={() => setSelected(provider)}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
          <provider.icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span>{provider.name}</span>
      </Button>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" size="icon" className="h-10 w-10 rounded-md">
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-semibold">Add Nodes</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Build your automation workflow
          </p>
        </SheetHeader>

        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-4 p-2">
          {/* Trigger types */}
          {nodes.length === 0 && triggerTypes.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Triggers</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Start your workflow with these triggers
                </p>
              </div>
              <div className="flex justify-start items-center gap-2">
                {triggerTypes.map(renderProviderButton)}
              </div>
            </div>
          )}

          {/* Integrations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Integrations</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect with external services
              </p>
            </div>
            <div className="flex justify-start items-center gap-2">
              {/* Gmail Integration */}
              <EmailDialog
                provider={providers.find((p) => p.id === "gmail")}
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
                onAddNode={handleAddNode}
              />

              {/* AI Agent Integration */}
              <AiAgentDialog
                provider={providers.find((p) => p.id === "ai-agent")}
                open={aiAgentDialogOpen}
                onOpenChange={setAiAgentDialogOpen}
                onAddNode={handleAddNode}
              />

              {/* Telegram Integration */}
              <TelegramDialog
                provider={providers.find((p) => p.id === "telegram")}
                open={telegramDialogOpen}
                onOpenChange={setTelegramDialogOpen}
                onAddNode={handleAddNode}
              />
            </div>
          </div>

          {/* GitHub Webhook */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Version Control</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect with your repositories
              </p>
            </div>
            <div className="space-y-2">
              <GitWebhookDialog
                provider={{ name: "GitHub Webhook", icon: Github }}
                open={gitWebhookDialogOpen}
                onOpenChange={setGitWebhookDialogOpen}
                onAddNode={handleAddNode}
              />
            </div>
          </div>

          {/* Other providers */}
          {otherProviders.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">
                    {nodes.length === 0 ? "Actions" : "Additional Nodes"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add more functionality to your workflow
                </p>
              </div>
              <div className="space-y-2">
                {otherProviders.map(renderProviderButton)}
              </div>
            </div>
          )}

          {/* Selected Node Preview */}
          {selected && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                  <selected.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">{selected.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ready to add to workflow
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onAddNode(selected);
                    setSelected(null);
                    toast.success(`${selected.name} node added!`);
                  }}
                  className="w-full"
                >
                  Add Node
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
