"use client";
import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import * as Icons from "lucide-react";

export default function ProviderNode({ id, data, deleteNode }: any) {
  const { name, icon: iconName, type, data: nodeData } = data;

  const Icon = iconName
    ? (Icons[iconName as keyof typeof Icons] as React.ComponentType<{
        size?: number;
        className?: string;
      }>)
    : null;

  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isFormNode = type === "FORM" || nodeData?.form_name;

  return (
    <div
      className={`group relative rounded-xl shadow-lg p-4 min-w-[180px] max-w-[260px] transition-all duration-300 cursor-pointer`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${isFormNode ? "#3B82F6" : "#E5E7EB"}`,
        background: isFormNode
          ? "linear-gradient(135deg, #EBF4FF 0%, #FFFFFF 100%)"
          : "#FFFFFF",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              isFormNode ? "bg-blue-100" : "bg-gray-50"
            }`}
          >
            <Icon
              size={18}
              className={isFormNode ? "text-blue-600" : "text-gray-600"}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-900 text-sm leading-snug block truncate">
            {name}
          </span>
          {isFormNode && (
            <span className="text-xs text-blue-600 font-medium">Form Node</span>
          )}
        </div>
      </div>

      {/* Node Details */}
      {isFormNode && nodeData?.fields && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-xs text-blue-500 hover:underline mb-1"
          >
            {showDetails ? "Hide fields" : "Show fields"}
          </button>
          {showDetails && (
            <div className="mt-1 p-2 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
              <div className="text-xs text-gray-600 font-medium mb-1">
                Fields:
              </div>
              <div className="space-y-1">
                {nodeData.fields
                  .slice(0, 5)
                  .map((field: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-700 truncate flex-1">
                        {field.label}
                      </span>
                      <span className="text-blue-600 font-mono ml-2">
                        {field.type}
                      </span>
                    </div>
                  ))}
                {nodeData.fields.length > 5 && (
                  <div className="text-xs text-gray-500 italic">
                    +{nodeData.fields.length - 5} more fields
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Button */}
      {hovered && (
        <button
          onClick={() => deleteNode(id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors duration-150 z-10"
          title="Delete Node"
        >
          <Trash2 size={12} />
        </button>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors rounded-full"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors rounded-full"
        style={{ right: -6 }}
      />
    </div>
  );
}
