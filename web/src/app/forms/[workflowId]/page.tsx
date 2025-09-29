"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

// Define allowed field types
// Equivalent to:
type FieldType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "password"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

// Define schema of each field
interface Field {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

// Values can be string, number, or boolean depending on field type
type FormValue = string | number | boolean;

// Form data: dynamic keys, safe values
type FormData = Record<string, FormValue>;

const Page = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState<string | undefined>();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/workflows/form/${workflowId}`
        );
        console.log("response", res.data);

        const workflow = res.data.data;

        // Find the form-builder node
        const formNode = workflow.nodes.find(
          (n: { data?: { type?: string } }) => n.data?.type === "form-builder"
        );

        if (formNode && formNode.data?.data?.fields) {
          setFormName(formNode.data.data.form_name);

          const fetchedFields: Field[] = formNode.data.data.fields;
          setFields(fetchedFields);

          // Initialize formData with empty strings
          const initialData: FormData = {};
          fetchedFields.forEach((f) => {
            initialData[f.key] = f.type === "checkbox" ? false : "";
          });
          setFormData(initialData);
        } else {
          toast.error("No form fields found");
        }
      } catch (err) {
        toast.error("Failed to load form");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [workflowId]);

  const handleChange = (key: string, value: FormValue) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${BACKEND_URL}/webhook/${workflowId}`, {
        data: {
          formData,
          submittedAt: new Date().toISOString(),
          source: "web-form",
        },
      });

      toast.success("Form submitted successfully!");

      // Reset form
      const resetData: FormData = {};
      fields.forEach((f) => {
        resetData[f.key] = f.type === "checkbox" ? false : "";
      });
      setFormData(resetData);
    } catch (err) {
      toast.error("Submission failed");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6">{formName}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder || ""}
                  value={String(formData[field.key] ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full border rounded px-3 py-2"
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(formData[field.key])}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="h-4 w-4"
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={String(formData[field.key] ?? "")}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      field.type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                  required={field.required}
                  className="w-full border rounded px-3 py-2"
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
