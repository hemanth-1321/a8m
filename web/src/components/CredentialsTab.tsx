"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Key, Shield } from "lucide-react";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import AddCredentialsDialog from "@/components/AddCredentialsDialog";

interface Credential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function CredentialsTab() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load credentials
  const loadCredentials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN);
      const response = await axios.get(`${BACKEND_URL}/credentials/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Safely extract the array
      const creds: Credential[] =
        response.data?.data || response.data?.response?.data || [];

      setCredentials(creds);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  // Delete credential
  const deleteCredential = async (credentialId: string) => {
    try {
      const token = localStorage.getItem(TOKEN);
      await axios.delete(`${BACKEND_URL}/credentials/${credentialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from state immediately
      setCredentials((prev) => prev.filter((cred) => cred.id !== credentialId));
      toast.success("Credential deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete credential");
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  // Handle credentials added
  const handleCredentialsAdded = () => {
    loadCredentials();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Credentials</h2>
          <p className="text-muted-foreground">
            Manage your service credentials and API keys
          </p>
        </div>
        <AddCredentialsDialog onCredentialsAdded={handleCredentialsAdded} />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading credentials...</p>
            </div>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Key className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No credentials found</h3>
            <p className="text-muted-foreground mb-4">
              Add credentials to connect your workflows with external services
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {credential.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Type: {credential.type}</span>
                        <span>
                          Added:{" "}
                          {new Date(credential.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCredential(credential.id)}
                    className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
