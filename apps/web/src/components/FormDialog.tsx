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
import { Plus, Trash2 } from "lucide-react";
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

      // Auto-generate key when label changes
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
          className="justify-start gap-2 mt-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Form Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Form Name *
            </label>
            <Input
              placeholder="Enter form name (e.g., Contact Form)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Form Fields ({fields.length})
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addField}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
                No fields added yet. Click "Add Field" to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-md bg-gray-50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">
                        Field {idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(idx)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>

                    <Input
                      placeholder="Field Label (e.g., Email Address)"
                      value={field.label}
                      onChange={(e) =>
                        updateField(idx, "label", e.target.value)
                      }
                      className="text-sm"
                    />

                    <select
                      value={field.type}
                      onChange={(e) => updateField(idx, "type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select field type</option>
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="password">Password</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio Button</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>
                    </select>

                    {field.label && (
                      <div className="text-xs text-gray-500">
                        Key:{" "}
                        {field.key ||
                          field.label
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                            .replace(/[^a-z0-9_]/g, "")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFormNode}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formName.trim() || fields.length === 0}
          >
            Save & Add Node ({fields.length} fields)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
