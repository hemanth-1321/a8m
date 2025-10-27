import { Mail, Plus, Github, Zap, Workflow, Bot, MessageSquare } from "lucide-react";

export const providers = [
  {
    id: "manual-trigger",
    name: "Manual Trigger",
    icon: Zap,
  },
  {
    id: "form",
    name: "Form",
    icon: Plus,
  },
  {
    id: "webhook",
    name: "Webhook",
    icon: Workflow,
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
  },
  {
    id: "ai-agent",
    name: "AI Agent",
    icon: Bot,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageSquare,
  },
];
