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
import { BACKEND_URL, TOKEN } from "@/lib/config";
import axios from "axios";

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

  // New state for node type toggle
  const [isSendAndWait, setIsSendAndWait] = useState(false);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const handleAddEmailNode = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Body cannot be empty");
      return;
    }

    if (isSendAndWait) {
      if (!email.trim() || !appPassword.trim()) {
        toast.error("Email and App Password are required for Send & Wait mode");
        return;
      }

      try {
        const token = localStorage.getItem(TOKEN);
        if (!token) throw new Error("No authentication token found");

        const credData = {
          email: email.trim(),
          appPassword: appPassword.trim(),
        };

        // Send credentials to backend
        await axios.post(
          `${BACKEND_URL}/credentials/create`,
          {
            name: provider.name.toLowerCase(),
            type: provider.type,
            data: credData,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success("Credentials saved successfully!");
      } catch (error: any) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to save credentials"
        );
        return; // stop adding the node if credentials fail
      }
    }

    // Build node
    const emailNode: any = {
      id: `email-${Date.now()}`,
      name: isSendAndWait ? "Send & Wait for Email" : "Send Email",
      type: "action",
      icon: "Mail",
      color: isSendAndWait
        ? "from-blue-500 to-indigo-600"
        : "from-green-500 to-emerald-600",
      data: {
        subject: subject.trim(),
        body: body.trim(),
      },
    };

    if (enableTo && to.trim()) {
      emailNode.data.to = to.trim();
    }

    if (isSendAndWait) {
      emailNode.data.email = email.trim();
      emailNode.data.appPassword = appPassword.trim();
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
    setIsSendAndWait(false);
    setEmail("");
    setAppPassword("");
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

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isSendAndWait
              ? "📧 Send & Wait Email Automation"
              : "📧 Send Email Automation"}
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            {isSendAndWait
              ? "Configure automated email sending with response waiting capabilities"
              : "Set up instant email delivery for your workflow"}
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Enhanced Toggle for Email Mode */}
          <div className="relative">
            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                isSendAndWait
                  ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                  : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isSendAndWait ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      {isSendAndWait ? "⏳" : "🚀"}
                    </div>
                    <div>
                      <Label
                        className={`text-lg font-semibold ${
                          isSendAndWait ? "text-blue-800" : "text-green-800"
                        }`}
                      >
                        {isSendAndWait
                          ? "Send & Wait Mode"
                          : "Instant Send Mode"}
                      </Label>
                      <p
                        className={`text-sm mt-1 ${
                          isSendAndWait ? "text-blue-600" : "text-green-600"
                        }`}
                      >
                        {isSendAndWait
                          ? "📬 Send email and pause workflow until reply is received"
                          : "⚡ Send email instantly and continue to next step"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Switch
                    checked={isSendAndWait}
                    onCheckedChange={setIsSendAndWait}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-500">
                    Toggle Mode
                  </span>
                </div>
              </div>

              {/* Mode-specific feature highlights */}
              <div className="mt-4 pt-4 border-t border-opacity-30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isSendAndWait ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Email monitoring & response detection
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Workflow pause until reply received
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Secure credential management
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Automatic response processing
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Instant email delivery
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        No workflow interruption
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Simple configuration
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        High-speed processing
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Email Credentials for Send & Wait mode */}
          {isSendAndWait && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-pulse"></div>
              <div className="relative p-6 border-2 border-blue-300 rounded-xl bg-white/80 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">🔐</div>
                  <div>
                    <Label className="text-lg font-semibold text-blue-800 block">
                      Email Authentication Setup
                    </Label>
                    <p className="text-sm text-blue-600">
                      Required for monitoring and receiving email responses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Your Email Address *
                    </Label>
                    <Input
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      App Password *
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="text-lg">💡</div>
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Security Tip:
                      </p>
                      <p className="text-blue-700">
                        Use an App Password generated from your email provider's
                        security settings, not your regular login password. This
                        ensures secure authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Email Configuration Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-gray-100 rounded-full">⚙️</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Email Configuration
              </h3>
            </div>

            {/* Enhanced Toggle for To field */}
            <div
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                enableTo
                  ? "border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full transition-colors ${
                      enableTo ? "bg-orange-100" : "bg-gray-100"
                    }`}
                  >
                    {enableTo ? "📧" : "📨"}
                  </div>
                  <div>
                    <Label
                      className={`text-sm font-medium ${
                        enableTo ? "text-orange-800" : "text-gray-700"
                      }`}
                    >
                      Custom Recipient Email
                    </Label>
                    <p
                      className={`text-xs mt-0.5 ${
                        enableTo ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {enableTo
                        ? "Custom recipient email is enabled"
                        : "Using dynamic recipient from workflow"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="enableTo"
                  checked={enableTo}
                  onCheckedChange={setEnableTo}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </div>

            {enableTo && (
              <div className="animate-in slide-in-from-top duration-200">
                <div className="p-4 border-2 border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                  <Label className="text-sm font-medium text-orange-800 mb-2 block flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Recipient Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-2">
                    <span>💡</span>
                    Leave empty to use dynamic recipient from previous workflow
                    steps
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Subject and Body fields */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Email Subject *
                </Label>
                <Input
                  placeholder="Message from {{previous_node.name}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-base p-3 border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Email Body *
                </Label>
                <Textarea
                  rows={8}
                  placeholder="Type your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="text-base p-3 border-2 border-gray-200 focus:border-pink-400 focus:ring-pink-400 resize-none"
                />
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 flex items-center gap-2">
                    <span>🔤</span>
                    Use template variables like{" "}
                    <code className="bg-purple-200 px-2 py-1 rounded text-xs font-mono">
                      {"{{previous_node.name}}"}
                    </code>{" "}
                    to personalize your message
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={resetForm}
            className="px-8 py-2 border-2 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddEmailNode}
            className={`px-8 py-2 text-base font-medium shadow-lg transition-all duration-200 ${
              isSendAndWait
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-200"
            }`}
          >
            {isSendAndWait ? "🚀 Add Send & Wait Node" : "⚡ Add Send Node"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
