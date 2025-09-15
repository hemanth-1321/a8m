import {
  Bot,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  Zap,
  FileText,
} from "lucide-react";

export const providers = [
  {
    id: "openai",
    name: "OpenAI",
    type: "openai key",
    icon: Bot,
    color: "from-emerald-500 to-teal-600",
    description: "GPT models and AI services",
    fields: [{ label: "API Key", key: "api_key", placeholder: "sk-xxxx" }],
  },
  {
    id: "slack",
    name: "Slack",
    type: "slack token",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600",
    description: "Team communication platform",
    fields: [
      { label: "Bot Token", key: "bot_token", placeholder: "xoxb-xxxx" },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "gmail oauth",
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
    type: "telegram bot",
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
    type: "google ai key",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-600",
    description: "Google's AI model platform",
    fields: [{ label: "API Key", key: "api_key", placeholder: "AIza-xxxx" }],
  },
  {
    id: "groq",
    name: "Groq",
    type: "groq key",
    icon: Zap,
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
];
