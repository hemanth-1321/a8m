"use client";
import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2 } from "lucide-react";

export default function ProviderNode({ id, data, deleteNode }: any) {
  const { name, icon: Icon } = data;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-2 min-w-[140px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main content */}
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex-shrink-0 w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center">
            <Icon size={14} className="text-gray-600" />
          </div>
        )}
        <span className="font-medium text-gray-900 text-xs leading-snug">
          {name}
        </span>
      </div>

      {/* Delete button - appears on hover */}
      {hovered && (
        <button
          onClick={() => deleteNode(id)}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors duration-150"
          title="Delete Node"
        >
          <Trash2 size={10} />
        </button>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
      />

      {/* Removed accent line below the node */}
    </div>
  );
}
