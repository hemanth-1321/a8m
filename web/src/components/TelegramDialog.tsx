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
import { Card } from "@/components/ui/card";
import { MessageSquare, Bot, Hash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TelegramDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

export default function TelegramDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: TelegramDialogProps) {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [nodeName, setNodeName] = useState("Telegram Bot");

  const handleAddTelegramNode = () => {
    if (!botToken.trim()) {
      toast.error("Bot Token is required");
      return;
    }

    if (!chatId.trim()) {
      toast.error("Chat ID is required");
      return;
    }

    const telegramNode = {
      id: `telegram-${Date.now()}`,
      name: nodeName.trim(),
      type: "action",
      icon: "MessageSquare",
      color: "from-blue-400 to-blue-600",
      data: {
        bot_token: botToken.trim(),
        chat_id: chatId.trim(),
        node_name: nodeName.trim(),
      },
    };

    onAddNode(telegramNode);
    resetForm();
    toast.success(`Telegram node "${nodeName}" created successfully`);
  };

  const resetForm = () => {
    onOpenChange(false);
    setBotToken("");
    setChatId("");
    setNodeName("Telegram Bot");
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
            <MessageSquare className="h-5 w-5" />
            Create Telegram Bot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Node Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Node Name *</label>
            <Input
              placeholder="e.g., Telegram Notifications, Alert Bot"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Bot Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Bot Token *
            </label>
            <Input
              type="password"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="h-10 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get your bot token from{" "}
              <a
                href="https://t.me/botfather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @BotFather
              </a>{" "}
              on Telegram
            </p>
          </div>

          {/* Chat ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Chat ID *
            </label>
            <Input
              placeholder="-123456789 or @username"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="h-10 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Chat ID can be a number (e.g., -123456789) or username (e.g.,
              @channelname)
            </p>
          </div>

          {/* Help Card */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              How to get Chat ID:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>
                For personal chat: Send a message to your bot, then visit{" "}
                <code className="bg-blue-100 px-1 rounded">
                  https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
                </code>
              </li>
              <li>
                For groups: Add your bot to the group and use the group's
                negative ID
              </li>
              <li>
                For channels: Use @channelname or the channel's negative ID
              </li>
            </ul>
          </Card>

          {/* Configuration Summary */}
          {botToken && chatId && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {nodeName || "Untitled Telegram Bot"}
              </span>
              <span className="text-sm text-muted-foreground">
                Ready to send messages
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddTelegramNode}
            disabled={!botToken.trim() || !chatId.trim() || !nodeName.trim()}
          >
            Create Telegram Bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
