"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

interface Field {
  label: string;
  type: string;
  placeholder?: string;
  key: string;
  options?: string[];
  required?: boolean;
}

const Page = () => {
  const { workflowId } = useParams();
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState();
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/workflows/form/${workflowId}`
        );
        console.log("response", res.data);

        // Workflow object is in res.data.data
        const workflow = res.data.data;

        // Find the node that is a form-builder
        const formNode = workflow.nodes.find(
          (n: any) => n.data?.type === "form-builder"
        );

        if (formNode && formNode.data?.data?.fields) {
          setFormName(formNode.data.data.form_name);
          setFields(formNode.data.data.fields);

          // Initialize formData
          const initialData: Record<string, any> = {};
          formNode.data.data.fields.forEach((f: Field) => {
            initialData[f.key] = "";
          });

          setFormData(initialData);
        } else {
          toast.error("No form fields found");
        }
      } catch (err: any) {
        toast.error("Failed to load form");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [workflowId]);

  const handleChange = (label: string, value: any) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
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
      setFormData(fields.reduce((acc, f) => ({ ...acc, [f.label]: "" }), {}));
    } catch (err: any) {
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
    <div className="min-h-screen flex items-center justify-center x-4">
      <div className=" p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6">{formName}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium  mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder || ""}
                  value={formData[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required={field.required}
                  className="w-full border rounded px-3 py-2"
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={formData[field.label]}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  required={field.required}
                  className="w-full border rounded px-3 py-2"
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer "
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
