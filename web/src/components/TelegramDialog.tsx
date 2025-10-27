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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { MessageSquare } from "lucide-react";

interface TelegramNodeData {
  botToken: string;
  chatId: string;
  message: string;
}

interface TelegramNode {
  id: string;
  name: string;
  type: "action";
  icon: LucideIcon;
  color: string;
  data: TelegramNodeData;
}

interface TelegramDialogProps {
  provider: {
    id: string;
    name: string;
    icon: LucideIcon;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: TelegramNode) => void;
}

export default function TelegramDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: TelegramDialogProps) {
  const [botToken, setBotToken] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleAddTelegramNode = () => {
    if (!botToken || !chatId || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    const telegramNode: TelegramNode = {
      id: `telegram-${Date.now()}`,
      name: "Telegram Message",
      type: "action",
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600",
      data: {
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        message: message.trim(),
      },
    };

    onAddNode(telegramNode);
    resetForm();

    toast.success("Telegram message node added successfully!");
  };

  const resetForm = () => {
    onOpenChange(false);
    setBotToken("");
    setChatId("");
    setMessage("");
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
          className="justify-start gap-2 mt-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <MessageSquare className="h-4 w-4" />
          Telegram
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Telegram Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="botToken">Bot Token</Label>
            <Input
              id="botToken"
              placeholder="Enter your Telegram Bot Token"
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <Input
              id="chatId"
              placeholder="Enter the Chat ID"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Enter the message to send"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button onClick={handleAddTelegramNode} disabled={!botToken || !chatId || !message}>
            Add Telegram Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
