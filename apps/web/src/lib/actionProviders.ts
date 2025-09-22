import {
  Bot,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  Zap,
  FileText,
  Webhook,
  Play,
  Brain,
} from "lucide-react";

export const providers = [
  {
    id: "openai",
    name: "OpenAI",
    type: "action",
    icon: Bot, // Use actual component
    Ai: true,
    color: "from-emerald-500 to-teal-600",
    description: "GPT models and AI services",
    fields: [{ label: "API Key", key: "api_key", placeholder: "sk-xxxx" }],
  },
  {
    id: "slack",
    name: "Slack",
    type: "action",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600",
    description: "Team communication platform",
    fields: [
      { label: "Bot Token", key: "bot_token", placeholder: "xoxb-xxxx" },
    ],
  },
  {
    id: "ai-agent",
    name: "AI Agent",
    type: "ai-agent",
    icon: Brain,
    color: "from-purple-500 to-pink-600",
    description: "LLM agent with tool selection",
    fields: [], // handled by AiAgentDialog
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "action",
    icon: Mail,
    color: "from-red-500 to-orange-600",
    description: "Email automation and management",
    fields: [
      { label: "OAuth Token", key: "oauth_token", placeholder: "ya29...." },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    type: "action",
    icon: Send,
    color: "from-blue-500 to-cyan-600",
    description: "Messaging bot integration",
    fields: [
      { label: "Bot Token", key: "bot_token", placeholder: "12345:ABC..." },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    type: "action",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-600",
    Ai: true,
    description: "Google's AI model platform",
    fields: [{ label: "API Key", key: "api_key", placeholder: "AIza-xxxx" }],
  },
  {
    id: "groq",
    name: "Groq",
    type: "action",
    icon: Zap,
    Ai: true,
    color: "from-yellow-500 to-orange-600",
    description: "High-speed AI inference",
    fields: [{ label: "API Key", key: "api_key", placeholder: "gsk-xxxx" }],
  },
  {
    id: "form",
    name: "Form",
    type: "form-builder",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    description: "Custom form builder",
    fields: [], // user-defined
  },
  {
    id: "webhook",
    name: "Webhook",
    type: "webhook",
    icon: Webhook,
    color: "from-green-500 to-emerald-600",
    description: "HTTP webhook integration",
    fields: [], // user-defined in dialog
  },
  {
    id: "manual-trigger",
    name: "Manual Trigger",
    type: "manual-trigger",
    icon: Play,
    color: "from-purple-500 to-indigo-600",
    description: "Manual workflow trigger",
    fields: [], // user-defined in dialog
  },
];
