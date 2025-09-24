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
  Globe,
  Github,
} from "lucide-react";

export const providers = [
  {
    id: "openai",
    name: "OpenAI",
    type: "action",
    icon: Bot,
    Ai: true,
    hidden: true, // hide from sidebar
    color: "from-emerald-500 to-teal-600",
    description: "GPT models and AI services",
    fields: [{ label: "API Key", key: "api_key", placeholder: "sk-xxxx" }],
  },
  {
    id: "github",
    name: "Github",
    type: "action",
    icon: Github,
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
    hidden: true, // hide from sidebar
    color: "from-purple-500 to-pink-600",
    noCredentials: true,
    description: "LLM agent with tool selection",
    fields: [],
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "action",
    icon: Mail,
    hidden: true, // hide from sidebar
    color: "from-red-500 to-orange-600",
    description: "Email automation and management",
    fields: [
      { label: "OAuth Token", key: "oauth_token", placeholder: "ya29...." },
    ],
  },

  {
    id: "gemini",
    name: "Gemini",
    type: "action",
    icon: Sparkles,
    Ai: true,
    hidden: true, // hide from sidebar
    color: "from-indigo-500 to-purple-600",
    description: "Google's AI model platform",
    fields: [{ label: "API Key", key: "api_key", placeholder: "AIza-xxxx" }],
  },
  {
    id: "groq",
    name: "Groq",
    type: "action",
    icon: Zap,
    Ai: true,
    hidden: true, // hide from sidebar
    color: "from-yellow-500 to-orange-600",
    description: "High-speed AI inference",
    fields: [{ label: "API Key", key: "api_key", placeholder: "gsk-xxxx" }],
  },
  {
    id: "form",
    name: "Form",
    type: "form-builder",
    icon: FileText,
    noCredentials: true, // exclude from credentials page
    color: "from-blue-500 to-indigo-600",
    description: "Custom form builder",
    fields: [],
  },
  {
    id: "webhook",
    name: "Webhook",
    type: "webhook",
    icon: Webhook,
    color: "from-green-500 to-emerald-600",
    description: "HTTP webhook integration",
    fields: [],
  },
  {
    id: "manual-trigger",
    name: "Manual Trigger",
    type: "manual-trigger",
    icon: Play,
    noCredentials: true, // exclude from credentials page
    color: "from-purple-500 to-indigo-600",
    description: "Manual workflow trigger",
    fields: [],
  },
  {
    id: "notion",
    name: "Notion",
    type: "action",
    icon: FileText,
    color: "from-gray-500 to-black",
    description: "Save data to Notion pages or databases",
    fields: [],
  },
];
