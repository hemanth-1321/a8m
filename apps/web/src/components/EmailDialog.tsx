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
      name: "Send Email",
      type: "action",
      icon: "Mail",
      color: "from-green-500 to-emerald-600",
      data: {
        subject: subject.trim(),
        body: body.trim(),
      },
    };

    if (enableTo && to.trim()) {
      emailNode.data.to = to.trim();
    }

    onAddNode(emailNode);
    resetForm();
  };

  const resetForm = () => {
    onOpenChange(false);
    setEnableTo(false);
    setTo("");
    setSubject("Message from {{previous_node.name}}");
    setBody(
      `Hi {{previous_node.name}},\n\nThank you for reaching out.\n\nWe will get back to you soon.\n\nBest,\nYour Team`
    );
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
          className="justify-start gap-2 mt-2 border-dashed border-green-300 text-green-600 hover:bg-green-50"
        >
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Toggle for To field */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enableTo"
              className="text-sm font-medium text-gray-700"
            >
              Add "To" Email
            </Label>
            <Switch
              id="enableTo"
              checked={enableTo}
              onCheckedChange={setEnableTo}
            />
          </div>

          {enableTo && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                To
              </label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you want to use a default or dynamic recipient.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Subject *
            </label>
            <Input
              placeholder="Email subject (e.g., Message from {{previous_node.name}})"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Body *
            </label>
            <Textarea
              rows={8}
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use variables like <code>{"{{previous_node.name}}"}</code> inside
              your message.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddEmailNode}
            className="bg-green-600 hover:bg-green-700"
          >
            Save & Add Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
