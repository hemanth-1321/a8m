"use client";

import { useState, useCallback } from "react";
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

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = (provider: any) => {
    setNodes((nds) => [
      ...nds,
      {
        id: `n${nds.length + 1}`,
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

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  }, []);

  const updateNodeData = (nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  };

  const saveWorkflow = async () => {
    const payload = {
      title: workflowTitle,
      enabled: workflowEnabled,
      nodes: nodes.map((n) => ({
        title: n.data.name,
        trigger: n.data.trigger || "Manual",
        enabled: n.data.enabled !== undefined ? n.data.enabled : true,
        data: n.data,
        positionX: n.position.x,
        positionY: n.position.y,
      })),
      edges: edges.map((e) => ({
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

      console.log("Workflow saved:", response.data);
      toast.success("Workflow saved successfully!");
    } catch (error: any) {
      console.error("Failed to save workflow:", error.response || error);
      toast.error("Failed to save workflow!");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 10,
          left: 20,
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        Workflow Detail for ID: {id}
        <br />
        <input
          type="text"
          value={workflowTitle}
          onChange={(e) => setWorkflowTitle(e.target.value)}
          style={{ marginTop: 5, padding: 4, borderRadius: 4 }}
        />
        <label style={{ marginLeft: 10 }}>
          Enabled:
          <input
            type="checkbox"
            checked={workflowEnabled}
            onChange={(e) => setWorkflowEnabled(e.target.checked)}
            style={{ marginLeft: 5 }}
          />
        </label>
      </div>

      {/* Save button */}
      <Button
        onClick={saveWorkflow}
        className="absolute top-2 right-30 z-10 px-4 py-2 bg-green-500 text-white rounded"
      >
        Save Workflow
      </Button>

      <div className="">
        <Sidebar onAddNode={addNode} />
      </div>

      {/* ReactFlow Canvas */}
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
        style={{ background: "#1e1e1e" }}
      >
        <Background color="#DBDBDB" gap={16} />
      </ReactFlow>
    </div>
  );
}
