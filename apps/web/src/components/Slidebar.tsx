"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { providers } from "@/lib/actionProviders";
import FormDialog from "./FormDialog";
import WebhookDialog from "./WebhookDialog";
import ManualTriggerDialog from "./ManualTriggerDialog";
import EmailDialog from "./EmailDialog";
import AiAgentDialog from "./AiAgentDialog";

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

  const handleAddNode = (node: any) => {
    onAddNode(node);
    toast.success(`${node.name} node added successfully!`);
  };

  // Separate trigger types from other providers
  const triggerTypes = providers.filter((p) =>
    ["manual-trigger", "form", "webhook"].includes(p.id)
  );
  const otherProviders = providers.filter(
    (p) => !["manual-trigger", "form", "webhook"].includes(p.id)
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

    if (provider.id === "ai-agent") {
      return (
        <AiAgentDialog
          key={provider.id}
          provider={provider}
          open={aiAgentDialogOpen}
          onOpenChange={setAiAgentDialogOpen}
          onAddNode={handleAddNode}
        />
      );
    }

    if (provider.id === "gmail") {
      return (
        <div key={provider.id}>
          <Button
            variant="outline"
            className="justify-start gap-2 w-full"
            onClick={() => setEmailDialogOpen(true)}
          >
            <provider.icon className="h-4 w-4" />
            {provider.name}
          </Button>

          <EmailDialog
            provider={provider}
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            onAddNode={handleAddNode}
          />
        </div>
      );
    }

    // ✅ default fallback
    return (
      <Button
        key={provider.id}
        variant="outline"
        className="justify-start gap-2 w-full"
        onClick={() => setSelected(provider)}
      >
        <provider.icon className="h-4 w-4" />
        {provider.name}
      </Button>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" size="icon">
          <Plus size={40} />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Add Nodes</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4 h-full overflow-y-auto">
          {/* Show trigger types only when no nodes exist */}
          {nodes.length === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Trigger Types
              </h3>
              <div className="flex flex-col gap-2">
                {triggerTypes.map(renderProviderButton)}
              </div>
              <hr className="my-4" />
            </div>
          )}

          {/* All other providers */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {nodes.length === 0 ? "Actions" : "Add Nodes"}
            </h3>
            <div className="flex flex-col gap-2">
              {otherProviders.map(renderProviderButton)}
            </div>

            {/* Add selected provider node */}
            {selected && (
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    onAddNode(selected);
                    setSelected(null);
                    toast.success(`${selected.name} node added!`);
                  }}
                >
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
