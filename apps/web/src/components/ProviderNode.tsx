"use client";
import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import * as Icons from "lucide-react";
import { useTheme } from "next-themes";

export default function ProviderNode({ id, data, deleteNode }: any) {
  const { name, icon: iconName, type, data: nodeData } = data;
  const { theme } = useTheme();

  const Icon = iconName
    ? (Icons[iconName as keyof typeof Icons] as React.ComponentType<{
        size?: number;
        className?: string;
      }>)
    : null;

  const [hovered, setHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isFormNode = type === "FORM" || nodeData?.form_name;
  const isDark = theme === "dark";

  // Theme-aware colors
  const getNodeStyles = () => {
    if (isFormNode) {
      return {
        border: `2px solid ${isDark ? "#3B82F6" : "#2563EB"}`,
        background: isDark
          ? "linear-gradient(135deg, #1E3A8A 0%, #1F2937 100%)"
          : "linear-gradient(135deg, #EBF4FF 0%, #FFFFFF 100%)",
      };
    }
    return {
      border: `2px solid ${isDark ? "#374151" : "#E5E7EB"}`,
      background: isDark
        ? "linear-gradient(135deg, #374151 0%, #1F2937 100%)"
        : "linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)",
    };
  };

  const getIconContainerClass = () => {
    if (isFormNode) {
      return isDark
        ? "bg-blue-900/50 border border-blue-700"
        : "bg-blue-100 border border-blue-200";
    }
    return isDark
      ? "bg-gray-700 border border-gray-600"
      : "bg-gray-50 border border-gray-200";
  };

  const getIconClass = () => {
    if (isFormNode) {
      return isDark ? "text-blue-300" : "text-blue-600";
    }
    return isDark ? "text-gray-300" : "text-gray-600";
  };

  const getTextClass = () => {
    return isDark ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextClass = () => {
    if (isFormNode) {
      return isDark ? "text-blue-300" : "text-blue-600";
    }
    return isDark ? "text-gray-400" : "text-gray-600";
  };

  const getDetailsContainerClass = () => {
    return isDark
      ? "bg-blue-900/30 border border-blue-700/50 shadow-inner"
      : "bg-blue-50 border border-blue-200 shadow-inner";
  };

  return (
    <div
      className={`group relative rounded-xl shadow-lg transition-all duration-300 cursor-pointer
                  min-w-[160px] max-w-[240px] sm:min-w-[180px] sm:max-w-[260px]
                  p-3 sm:p-4 hover:shadow-xl
                  ${isDark ? "shadow-gray-900/50" : "shadow-gray-200"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={getNodeStyles()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        {Icon && (
          <div
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors
                       ${getIconContainerClass()}`}
          >
            <Icon
              size={16}
              className={`sm:w-[18px] sm:h-[18px] transition-colors ${getIconClass()}`}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span
            className={`font-semibold text-xs sm:text-sm leading-snug block truncate transition-colors
                           ${getTextClass()}`}
          >
            {name}
          </span>
          {isFormNode && (
            <span
              className={`text-xs font-medium transition-colors ${getSecondaryTextClass()}`}
            >
              Form Node
            </span>
          )}
        </div>
      </div>

      {/* Node Details */}
      {isFormNode && nodeData?.fields && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className={`flex items-center gap-1 text-xs hover:underline mb-1 transition-colors
                       ${isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-500 hover:text-blue-600"}`}
          >
            <span>{showDetails ? "Hide fields" : "Show fields"}</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showDetails && (
            <div
              className={`mt-1 p-2 rounded-lg transition-all duration-200 ${getDetailsContainerClass()}`}
            >
              <div
                className={`text-xs font-medium mb-1 transition-colors
                             ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Fields:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                {nodeData.fields
                  .slice(0, 5)
                  .map((field: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs gap-2"
                    >
                      <span
                        className={`truncate flex-1 transition-colors
                                     ${isDark ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {field.label}
                      </span>
                      <span
                        className={`font-mono text-xs px-1 py-0.5 rounded transition-colors flex-shrink-0
                                     ${
                                       isDark
                                         ? "text-blue-300 bg-blue-900/50"
                                         : "text-blue-600 bg-blue-100"
                                     }`}
                      >
                        {field.type}
                      </span>
                    </div>
                  ))}
                {nodeData.fields.length > 5 && (
                  <div
                    className={`text-xs italic transition-colors
                                 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
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
          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 
                     bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700
                     text-white rounded-full flex items-center justify-center 
                     shadow-md transition-all duration-150 z-20 hover:scale-110
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          title="Delete Node"
        >
          <Trash2 size={10} className="sm:w-3 sm:h-3" />
        </button>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 transition-all duration-200 rounded-full z-10
                   ${
                     isDark
                       ? "bg-gray-500 border-gray-800 hover:bg-blue-400"
                       : "bg-gray-400 border-white hover:bg-blue-500"
                   }`}
        style={{ left: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 transition-all duration-200 rounded-full z-10
                   ${
                     isDark
                       ? "bg-gray-500 border-gray-800 hover:bg-purple-400"
                       : "bg-gray-400 border-white hover:bg-purple-500"
                   }`}
        style={{ right: -5 }}
      />

      {/* Subtle glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                     ${
                       isFormNode
                         ? isDark
                           ? "shadow-blue-500/20"
                           : "shadow-blue-400/30"
                         : isDark
                           ? "shadow-gray-400/20"
                           : "shadow-gray-300/30"
                     } 
                     shadow-lg`}
      />
    </div>
  );
}
