"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/Slidebar";
import ProviderNode from "@/components/ProviderNode";
import { BACKEND_URL, TOKEN } from "@/lib/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

interface NodeData {
  name: string;
  icon?: string;
  color?: string;
  trigger?: "Manual" | "Cron" | "WebHook";
  enabled?: boolean;
  [key: string]: any;
}

export default function Page() {
  const { id } = useParams();

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState("My Updated Workflow");
  const [workflowEnabled, setWorkflowEnabled] = useState(true);

  // ReactFlow callbacks
  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Modified onConnect to use UUID for new edges
  const onConnect = useCallback((params: any) => {
    const newEdge = {
      ...params,
      id: uuidv4(),
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  // Add new node
  const addNode = (provider: any) => {
    const newId = uuidv4();
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: "providerNode",
        position: {
          x: 200 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        data: {
          name: provider.name,
          icon: provider.icon,
          color: provider.color,
          trigger: "Manual",
          enabled: true,
        },
      },
    ]);
  };

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  }, []);

  // Update node data
  const updateNodeData = (nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  };

  // Fetch workflow from server
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/workflows/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(TOKEN)}`,
          },
        });

        const wf = response.data.workflow;

        setWorkflowTitle(wf.title);
        setWorkflowEnabled(wf.enabled);

        // Load nodes
        const loadedNodes: Node<NodeData>[] = wf.Node.map((n: any) => ({
          id: n.id,
          type: "providerNode",
          position: { x: n.positionX, y: n.positionY },
          data: {
            ...n.data,
            name: n.title,
          },
        }));

        // Load edges (ensure they match loaded node IDs)
        const validNodeIds = new Set(loadedNodes.map((n) => n.id));
        const loadedEdges: Edge[] = wf.Edge.filter(
          (e: any) =>
            validNodeIds.has(e.sourceNodeId) && validNodeIds.has(e.targetNodeId)
        ).map((e: any) => ({
          id: e.id,
          source: e.sourceNodeId,
          target: e.targetNodeId,
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (error: any) {
        console.error("Failed to load workflow:", error.response || error);
        toast.error("Failed to load workflow!");
      }
    };

    if (id) fetchWorkflow();
  }, [id]);

  // Save workflow
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
        positionX: n.position.x,
        positionY: n.position.y,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sourceNodeId: e.source,
        targetNodeId: e.target,
      })),
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/workflows/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(TOKEN)}`,
          },
        }
      );

      const savedWf = response.data;
      console.log("response", savedWf);
      // Replace with DB IDs
      const syncedNodes: Node<NodeData>[] = savedWf.Node.map((n: any) => ({
        id: n.id,
        type: "providerNode",
        position: { x: n.positionX, y: n.positionY },
        data: {
          ...n.data,
          name: n.title,
        },
      }));

      const validNodeIds = new Set(syncedNodes.map((n) => n.id));
      const syncedEdges: Edge[] = savedWf.Edge.filter(
        (e: any) =>
          validNodeIds.has(e.sourceNodeId) && validNodeIds.has(e.targetNodeId)
      ).map((e: any) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
      }));

      setNodes(syncedNodes);
      setEdges(syncedEdges);

      console.log("Workflow saved:", savedWf);
      toast.success("Workflow saved successfully!");
    } catch (error: any) {
      console.error("Failed to save workflow:", error.response || error);
      toast.error("Failed to save workflow!");
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
          {/* Left */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">
                Workflow Builder
              </h1>
              <p className="text-sm text-gray-500">ID: {id}</p>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">
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

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="enabled"
                checked={workflowEnabled}
                onChange={(e) => setWorkflowEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="enabled"
                className="text-sm font-medium text-gray-700"
              >
                Enabled
              </label>
            </div>
          </div>

          {/* Right */}
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
            <Sidebar onAddNode={addNode} />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex h-[calc(100vh-88px)] relative">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={{
              providerNode: (props) => (
                <ProviderNode
                  {...props}
                  deleteNode={deleteNode}
                  updateNodeData={updateNodeData}
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
  );
}
