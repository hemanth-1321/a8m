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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Slidebar";
import ProviderNode from "@/components/ProviderNode";
import { Play } from "lucide-react";

interface NodeData {
  name?: string;
  icon?: string;
  color?: string;
  trigger?: "Manual" | "Cron" | "Webhook";
  enabled?: boolean;
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
}

interface RawEdge {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
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
  const [executing, setExecuting] = useState(false);

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState("my workflow");
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

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

  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: uuidv4(),
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const addNode = (provider: {
    data?: Record<string, any>;
    [key: string]: any;
  }) => {
    const newId = uuidv4();
    const providerData = provider.data || {};

    const newNode: Node<NodeData> = {
      id: newId,
      type: "providerNode",
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      data: {
        ...provider,
        ...providerData,
        trigger: "Manual",
        enabled: true,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
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
          // example: send all nodes info
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.data.name,
            trigger: n.data.trigger,
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
      setExecuting(false); // stop loading
    }
  };

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await axios.get<WorkflowResponse>(
          `${BACKEND_URL}/workflows/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const wf = response.data.data; // use .data

        setWorkflowTitle(wf.title);
        setWorkflowEnabled(wf.enabled);

        // Map nodes
        const loadNodes: Node<NodeData>[] = (wf.nodes || []).map((n) => ({
          id: n.id,
          type: "providerNode",
          position: { x: n.position_x ?? 200, y: n.position_y ?? 200 },
          data: {
            ...n.data,
            name: n.title,
            trigger: n.trigger || "Manual",
            enabled: n.enabled ?? true,
          },
        }));

        // Map edges
        const loadEdges: Edge[] = (wf.edges || []).map((e) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
        }));

        setNodes(loadNodes);
        setEdges(loadEdges);
      } catch (error) {
        console.error("Failed to fetch workflow:", error);
      }
    };

    if (token) fetchWorkflow();
  }, [id, token]);

  const saveWorkflow = async () => {
    const payload = {
      title: workflowTitle,
      enabled: workflowEnabled,
      nodes: nodes.map((n) => ({
        id: n.id,
        title: n.data.name,
        trigger: n.data.trigger || "Manual",
        enabled: n.data.enabled !== undefined ? n.data.enabled : true,
        data: n.data,
        position_x: n.position.x,
        position_y: n.position.y,
        workflow_id: id,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source_node_id: e.source,
        target_node_id: e.target,
        workflow_id: id,
      })),
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/workflows/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedWf = response.data;
      // ... same logic to sync nodes & edges
      toast.success("Workflow saved successfully!");
    } catch (error: any) {
      console.error("Failed to save workflow:", error.response || error);
      toast.error("Failed to save workflow!");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        {/*header */}
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
          {/* Left: Workflow Name */}
          <div className="flex flex-col">
            <label className="scroll-m-20 text-xs font-semibold tracking-tigh ml-2 mb-2">
              Workflow Name
            </label>
            <input
              type="text"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 
                  focus:border-transparent bg-white"
              placeholder="Enter workflow name"
            />
          </div>

          {/* Center: Enabled checkbox */}
          <div className="flex items-center gap-2"></div>

          {/* Right: Save + Sidebar */}
          <div className="flex items-center gap-6">
            <Button
              onClick={saveWorkflow}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 
                  hover:from-emerald-600 hover:to-teal-700 text-white 
                  px-6 py-2 rounded-lg font-medium shadow-lg 
                  transition-all duration-200 transform hover:scale-105"
            >
              Save Workflow
            </Button>
            <Button
              variant="outline"
              onClick={executeWorkflow}
              disabled={executing}
              className={`p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg flex items-center justify-center cursor-pointer ${
                executing ? "opacity-70 cursor-not-allowed" : ""
              }`}
              title="Execute Workflow"
            >
              {executing ? (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Sidebar onAddNode={addNode} />
          </div>
        </div>

        {/*Arena */}
        <div className="flex h-[calc(100vh-88px)] relative">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodeChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
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
              className="bg-transparent"
            >
              <Background
                color="#e5e7eb"
                gap={20}
                size={1}
                style={{ opacity: 0.4 }}
              />
            </ReactFlow>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Drag providers from the sidebar to create your automation
                    workflow
                  </p>
                </div>
              </div>
            )}

            {/* Canvas info */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Nodes: {nodes.length}</span>
                <span>Connections: {edges.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
