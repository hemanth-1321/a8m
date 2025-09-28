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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface EmailDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function EmailDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: EmailDialogProps) {
  const [enableTo, setEnableTo] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Message from {{previous_node.name}}");
  const [body, setBody] = useState(
    `Hi {{previous_node.name}},\n\nThank you for reaching out.\n\nWe will get back to you soon.\n\nBest,\nYour Team`
  );
  const [isSendAndWait, setIsSendAndWait] = useState(false);

  const handleAddEmailNode = () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Body cannot be empty");
      return;
    }

    const emailNode: any = {
      id: `email-${Date.now()}`,
      title: isSendAndWait ? "Send & Wait for Email" : "Send Email",
      type: "action",
      provider_type: "action",
      trigger: "Manual",
      enabled: true,
      data: {
        id: `email-node-${Date.now()}`,
        name: isSendAndWait ? "Send & Wait for Email" : "Send Email",
        type: "action",
        icon: "Mail",
        color: isSendAndWait
          ? "from-blue-500 to-indigo-600"
          : "from-green-500 to-emerald-600",
        subject: subject.trim(),
        body: body.trim(),
        sendAndWait: isSendAndWait,
        ...(enableTo && to.trim() ? { to: to.trim() } : {}),
      },
    };

    if (enableTo && to.trim()) {
      emailNode.data.to = to.trim();
    }

    onAddNode(emailNode);
    resetForm();
    toast.success(`Email node "${emailNode.name}" created successfully`);
  };

  const resetForm = () => {
    onOpenChange(false);
    setEnableTo(false);
    setTo("");
    setSubject("Message from {{previous_node.name}}");
    setBody(
      `Hi {{previous_node.name}},\n\nThank you for reaching out.\n\nWe will get back to you soon.\n\nBest,\nYour Team`
    );
    setIsSendAndWait(false);
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
          className="justify-start gap-2 mt-2 border-dashed border-green-300 text-blue-600 hover:bg-green-50"
        >
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Send & Wait Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Send & Wait Mode</Label>
              <div className="text-sm text-muted-foreground">
                Wait for email response before continuing workflow
              </div>
            </div>
            <Switch
              checked={isSendAndWait}
              onCheckedChange={setIsSendAndWait}
            />
          </div>

          {/* Custom Recipient Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Custom Recipient</Label>
              <div className="text-sm text-muted-foreground">
                Set a specific recipient email address
              </div>
            </div>
            <Switch checked={enableTo} onCheckedChange={setEnableTo} />
          </div>

          {/* Recipient Email */}
          {enableTo && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email *</label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject *</label>
            <Input
              placeholder="Message from {{previous_node.name}}"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Body *</label>
            <Textarea
              rows={6}
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Use template variables like {"{{previous_node.name}}"} to
              personalize your message
            </p>
          </div>

          {/* Configuration Summary */}
          {subject && body && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {isSendAndWait ? "Send & Wait for Email" : "Send Email"}
              </span>
              <span className="text-sm text-muted-foreground">
                Ready to send
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddEmailNode}
            disabled={!subject.trim() || !body.trim()}
          >
            Create Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
