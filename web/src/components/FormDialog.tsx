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
import { Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormField {
  label: string;
  type: string;
  key?: string;
}

interface FormDialogProps {
  provider: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (node: any) => void;
}

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "tel", label: "Phone" },
  { value: "password", label: "Password" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "date", label: "Date" },
];

export default function FormDialog({
  provider,
  open,
  onOpenChange,
  onAddNode,
}: FormDialogProps) {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = () => {
    const newField: FormField = { label: "", type: "text" };
    setFields((prev) => [...prev, newField]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, key: keyof FormField, value: string) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [key]: value };

      if (key === "label" && value.trim()) {
        updated[idx].key = value
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
      }

      return updated;
    });
  };

  const handleAddFormNode = () => {
    if (!formName.trim()) {
      toast.error("Form name is required");
      return;
    }

    if (fields.length === 0) {
      toast.error("At least one field is required");
      return;
    }

    const invalidFields = fields.filter(
      (field) => !field.label.trim() || !field.type
    );
    if (invalidFields.length > 0) {
      toast.error("All fields must have a label and type");
      return;
    }

    const processedFields = fields.map((field, index) => ({
      label: field.label.trim(),
      type: field.type,
      key:
        field.key ||
        field.label
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") ||
        `field_${index}`,
    }));

    const formNode = {
      id: `form-${Date.now()}`,
      name: formName.trim(),
      type: "form-builder",
      icon: "FileText",
      color: "from-blue-500 to-indigo-600",
      data: {
        form_name: formName.trim(),
        fields: processedFields,
      },
    };

    onAddNode(formNode);
    resetForm();
    toast.success(`Form "${formName}" created with ${fields.length} fields`);
  };

  const resetForm = () => {
    onOpenChange(false);
    setFormName("");
    setFields([]);
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
            <FileText className="h-5 w-5" />
            Create Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Form Name *</label>
            <Input
              placeholder="e.g., Contact Form, User Registration"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Form Fields ({fields.length})
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-muted-foreground mb-3">
                  No fields added yet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addField}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Field
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Field Label */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Label *
                        </label>
                        <Input
                          placeholder="Field label"
                          value={field.label}
                          onChange={(e) =>
                            updateField(idx, "label", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Field Type */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Type *
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(idx, "type", e.target.value)
                          }
                          className="w-full h-9 px-3 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(idx)}
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Generated Key Preview */}
                    {field.label && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Key:{" "}
                        <code className="font-mono">
                          {field.key ||
                            field.label
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/[^a-z0-9_]/g, "")}
                        </code>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Form Summary */}
          {fields.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {formName || "Untitled Form"}
              </span>
              <span className="text-sm text-muted-foreground">
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFormNode}
            disabled={!formName.trim() || fields.length === 0}
          >
            Create Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
