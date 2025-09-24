"use client";

import { useState } from "react";
import axios from "axios";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Loader2, Key, Check, ArrowLeft, Trash2 } from "lucide-react";
import { providers } from "@/lib/actionProviders";

interface Props {
  onCredentialsAdded: () => void;
}

export default function AddCredentialsDialog({ onCredentialsAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [credData, setCredData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setCredData({});
    setStep("configure");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedProvider(null);
    setCredData({});
  };

  const handleAddCredential = async () => {
    if (!selectedProvider) {
      toast.error("Please select a provider");
      return;
    }

    const provider = providers.find((p) => p.id === selectedProvider);
    if (!provider) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN);
      if (!token) throw new Error("No authentication token found");

      await axios.post(
        `${BACKEND_URL}/credentials/create`,
        {
          name: provider.name.toLowerCase(),
          type: provider.type,
          data: credData, // dump whole JSON, backend accepts raw
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Credentials added successfully!", {
        description: `${provider.name} credentials are now configured`,
        duration: 4000,
      });

      setSelectedProvider(null);
      setCredData({});
      setStep("select");
      setOpen(false);
      onCredentialsAdded();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add credentials";
      toast.error("Failed to add credentials", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderData = providers.find((p) => p.id === selectedProvider);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Credentials
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Key className="h-6 w-6 text-slate-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-slate-900">
            {step === "select"
              ? "Add New Credentials"
              : `Configure ${selectedProviderData?.name}`}
          </DialogTitle>
          <p className="text-center text-sm text-slate-600">
            {step === "select"
              ? "Choose a service to connect with your workflows"
              : "Enter your credentials to enable integration"}
          </p>
        </DialogHeader>

        {step === "select" ? (
          <div className="py-4">
            <div className="grid grid-cols-2 gap-3">
              {providers
                .filter((p) => !p.noCredentials) // 🚀 hide providers without credentials
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300"
                    onClick={() => handleProviderSelect(provider.id)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
                    />
                    <div className="relative flex flex-col items-center space-y-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${provider.color}`}
                      >
                        <provider.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-slate-900">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Provider header */}
            {selectedProviderData && (
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selectedProviderData.color}`}
                >
                  <selectedProviderData.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedProviderData.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedProviderData.description}
                  </p>
                </div>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              {selectedProviderData?.fields.map((field) => {
                if (field.repeatable && field.type === "array") {
                  const currentValues = credData[field.key] || [];

                  const addField = () => {
                    setCredData({
                      ...credData,
                      [field.key]: [...currentValues, {}],
                    });
                  };

                  const removeField = (idx: number) => {
                    const updated = currentValues.filter(
                      (_: any, i: number) => i !== idx
                    );
                    setCredData({ ...credData, [field.key]: updated });
                  };

                  const updateField = (
                    idx: number,
                    subKey: string,
                    value: string
                  ) => {
                    const updated = [...currentValues];
                    updated[idx] = { ...updated[idx], [subKey]: value };
                    setCredData({ ...credData, [field.key]: updated });
                  };

                  return (
                    <div key={field.key} className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">
                        {field.label}
                      </Label>
                      {currentValues.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 border rounded-lg p-3 bg-slate-50"
                        >
                          {field.fields.map((subField: any) => (
                            <Input
                              key={subField.key}
                              placeholder={subField.placeholder}
                              value={item[subField.key] || ""}
                              onChange={(e) =>
                                updateField(idx, subField.key, e.target.value)
                              }
                              className="flex-1"
                              disabled={loading}
                            />
                          ))}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addField}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Field
                      </Button>
                    </div>
                  );
                }

                // Normal single field
                return (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      {field.label}
                    </Label>
                    <Input
                      type="text"
                      value={credData[field.key] || ""}
                      onChange={(e) =>
                        setCredData({
                          ...credData,
                          [field.key]: e.target.value,
                        })
                      }
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="transition-all duration-200 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-3 pt-6 border-t border-slate-100">
          {step === "configure" && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step === "select" ? (
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          ) : (
            <Button
              onClick={handleAddCredential}
              disabled={loading || !selectedProvider}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Credentials
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
