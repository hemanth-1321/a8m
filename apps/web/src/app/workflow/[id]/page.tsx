"use client";

import { BACKEND_URL } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  ConnectionMode,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import ProviderNode from "@/components/ProviderNode";
import { Play, Save, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface NodeData {
  name?: string;
  icon?: string;
  color?: string;
  trigger?: "Manual" | "Cron" | "Webhook";
  enabled?: boolean;
  type?: string;
  id?: string;
  [key: string]: any;
}

interface RawNode {
  id: string;
  title: string;
  workflow_id: string;
  trigger?: "Manual" | "Cron" | "Webhook";
  enabled?: boolean;
  data?: Record<string, any>;
  position_x?: number;
  position_y?: number;
  type?: string | null;
  provider_type?: string;
}

interface RawEdge {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle?: string;
  target_handle?: string;
}

interface WorkflowResponse {
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    enabled: boolean;
    user_id: string;
    nodes: RawNode[];
    edges: RawEdge[];
  };
}

const page = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token, loadToken } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [executing, setExecuting] = useState(false);

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState("my workflow");
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveWorkflowLoading, setSaveWorkflowLoading] = useState(false);
  const [workflowLoading, setWorkFlowLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadToken();
      setLoading(false);
    };
    init();
  }, [loadToken]);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/auth");
    }
  }, [loading, token, router]);

  // Handle escape key to cancel edge creation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isConnecting) {
        setIsConnecting(false);
        setEdges((edges) => [...edges]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConnecting]);

  const onNodeChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) =>
        applyNodeChanges(changes, nds).map((node) => ({
          ...node,
          data: node.data as NodeData,
        }))
      ),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const connectionKey = `${params.source}-${params.sourceHandle || "default"}-${params.target}-${params.targetHandle || "default"}`;

      const existingEdge = edges.find((edge) => {
        const edgeKey = `${edge.source}-${edge.sourceHandle || "default"}-${edge.target}-${edge.targetHandle || "default"}`;
        return edgeKey === connectionKey;
      });

      if (existingEdge) {
        console.log("Connection already exists");
        return;
      }

      const newEdge: Edge = {
        id: uuidv4(),
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        style: {
          stroke: theme === "dark" ? "#a855f7" : "#8b5cf6",
          strokeWidth: 2,
        },
        animated: true,
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, theme]
  );

  const addNode = (provider: any) => {
    const newId = uuidv4();
    const providerData = provider.data || {};

    const newNode: Node<NodeData> = {
      id: newId,
      type: "providerNode",
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        ...provider,
        ...providerData,
        trigger: "Manual",
        enabled: true,
        type: provider.type || provider.id,
        id: provider.id,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newId;
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  }, []);

  const updateNode = (nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  };

  const executeWorkflow = async () => {
    setExecuting(true);

    try {
      const payload = {
        data: {
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.data.name,
            trigger: n.data.trigger,
            type: n.data.type || n.data.id,
          })),
          edges: edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          })),
        },
      };

      const response = await axios.post(
        `${BACKEND_URL}/webhook/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Workflow execution started!");
      }
    } catch (error: any) {
      console.error("Execution error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to execute workflow"
      );
    } finally {
      setExecuting(false);
    }
  };

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setWorkFlowLoading(true);
        const response = await axios.get<WorkflowResponse>(
          `${BACKEND_URL}/workflows/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const wf = response.data.data;

        setWorkflowTitle(wf.title);
        setWorkflowEnabled(wf.enabled);

        const loadNodes: Node<NodeData>[] = (wf.nodes || []).map((n) => ({
          id: n.id,
          type: "providerNode",
          position: { x: n.position_x ?? 200, y: n.position_y ?? 200 },
          data: {
            ...n.data,
            name: n.title,
            trigger: n.trigger || "Manual",
            enabled: n.enabled ?? true,
            type: n.type || n.provider_type,
            id: n.provider_type,
          },
        }));

        const loadEdges: Edge[] = (wf.edges || []).map((e) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          sourceHandle: e.source_handle,
          targetHandle: e.target_handle,
          style: {
            stroke: theme === "dark" ? "#a855f7" : "#8b5cf6",
            strokeWidth: 2,
          },
          animated: true,
        }));

        setNodes(loadNodes);
        setEdges(loadEdges);

        setWorkFlowLoading(false);
      } catch (error) {
        setWorkFlowLoading(false);
        toast.error("failed to fetch workflows");
        console.error("Failed to fetch workflow:", error);
      }
    };

    if (token) fetchWorkflow();
  }, [id, token, theme]);

  const saveWorkflow = async () => {
    setSaveWorkflowLoading(true);

    const currentNodeIds = new Set(nodes.map((n) => n.id));

    const validEdges = edges.filter((edge) => {
      const hasValidSource = currentNodeIds.has(edge.source);
      const hasValidTarget = currentNodeIds.has(edge.target);

      if (!hasValidSource || !hasValidTarget) {
        console.warn(`Filtering out invalid edge:`, {
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          sourceExists: hasValidSource,
          targetExists: hasValidTarget,
        });
      }

      return hasValidSource && hasValidTarget;
    });

    const payload = {
      title: workflowTitle,
      enabled: workflowEnabled,
      nodes: nodes.map((n) => ({
        id: n.id,
        title: n.data.name,
        trigger: n.data.trigger || "Manual",
        enabled: n.data.enabled ?? true,
        data: n.data,
        position_x: n.position.x,
        position_y: n.position.y,
        workflow_id: id,
        type: n.data.type || n.data.id,
        provider_type: n.data.type || n.data.id,
      })),
      edges: validEdges.map((e) => ({
        id: e.id,
        source_node_id: e.source,
        target_node_id: e.target,
        source_handle: e.sourceHandle,
        target_handle: e.targetHandle,
        workflow_id: id,
      })),
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/workflows/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const savedWf = response.data.data;

      const syncedNodes: Node<NodeData>[] = savedWf.nodes.map((n: any) => ({
        id: n.id,
        type: "providerNode",
        position: { x: n.position_x, y: n.position_y },
        data: {
          ...n.data,
          name: n.title,
          type: n.type || n.provider_type,
          id: n.provider_type,
        },
      }));

      const validNodeIds = new Set(syncedNodes.map((n) => n.id));
      const syncedEdges: Edge[] = savedWf.edges
        .filter(
          (e: any) =>
            validNodeIds.has(e.source_node_id) &&
            validNodeIds.has(e.target_node_id)
        )
        .map((e: any) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          sourceHandle: e.source_handle,
          targetHandle: e.target_handle,
          style: {
            stroke: theme === "dark" ? "#a855f7" : "#8b5cf6",
            strokeWidth: 2,
          },
          animated: true,
        }));

      setNodes(syncedNodes);
      setEdges(syncedEdges);
      setSaveWorkflowLoading(false);
      toast.success("Workflow saved successfully!");
    } catch (error: any) {
      setSaveWorkflowLoading(false);
      console.error("Failed to save workflow:", error.response || error);
      toast.error("Failed to save workflow!");
    }
  };

  if (loading || workflowLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-full mx-auto px-6 py-4">
          {/* Left Section - Workflow Name */}
          <div className="flex flex-col min-w-0 flex-1 max-w-sm">
            <label className="text-xs font-medium text-muted-foreground mb-2 ml-1">
              Workflow Name
            </label>
            <input
              type="text"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg text-sm 
                  focus:outline-none focus:ring-2 focus:ring-ring 
                  focus:border-transparent bg-background text-foreground
                  placeholder:text-muted-foreground"
              placeholder="Enter workflow name"
            />
          </div>

          {/* Center Section - Stats */}
          <div className="hidden md:flex items-center gap-6 px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Nodes: {nodes.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Connections: {edges.length}</span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Save Button */}
            <Button
              onClick={saveWorkflow}
              disabled={saveWorkflowLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 
                  hover:from-emerald-600 hover:to-teal-700 text-white 
                  px-4 py-2 rounded-lg font-medium shadow-lg 
                  transition-all duration-200 transform hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:transform-none"
            >
              {saveWorkflowLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </div>
              )}
            </Button>

            {/* Execute Button */}
            <Button
              onClick={executeWorkflow}
              disabled={executing || nodes.length === 0}
              className="bg-gradient-to-r from-purple-500 to-violet-600 
                  hover:from-purple-600 hover:to-violet-700 text-white 
                  px-4 py-2 rounded-lg font-medium shadow-lg 
                  transition-all duration-200 transform hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:transform-none"
            >
              {executing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>Execute</span>
                </div>
              )}
            </Button>

            {/* Sidebar Toggle */}
            {nodes.length > 0 && <Sidebar onAddNode={addNode} nodes={nodes} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)] relative">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodeChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={() => setIsConnecting(true)}
            onConnectEnd={() => setIsConnecting(false)}
            connectionMode={ConnectionMode.Loose}
            connectionLineStyle={{
              stroke: theme === "dark" ? "#a855f7" : "#8b5cf6",
              strokeWidth: 2,
            }}
            fitView
            nodeTypes={{
              providerNode: (props) => (
                <ProviderNode
                  {...props}
                  deleteNode={deleteNode}
                  updateNodeData={updateNode}
                />
              ),
            }}
            className="bg-background"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color={theme === "dark" ? "#374151" : "#d1d5db"}
              gap={20}
              size={1}
              style={{ opacity: theme === "dark" ? 0.2 : 0.3 }}
            />
            <Controls
              className="bg-card border border-border shadow-lg"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap
              className="bg-card border border-border shadow-lg"
              nodeColor={theme === "dark" ? "#6366f1" : "#8b5cf6"}
              maskColor={
                theme === "dark"
                  ? "rgba(0, 0, 0, 0.6)"
                  : "rgba(255, 255, 255, 0.6)"
              }
            />
          </ReactFlow>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                  <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Start Building Your Workflow
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add your first node to begin creating an automated workflow.
                  Connect different services and create powerful automations.
                </p>
                <Sidebar onAddNode={addNode} nodes={nodes} />
              </div>
            </div>
          )}

          {/* Status Bar */}
          {nodes.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Nodes: {nodes.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Connections: {edges.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${workflowEnabled ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span>{workflowEnabled ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
