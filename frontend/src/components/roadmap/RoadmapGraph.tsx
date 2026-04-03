"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import NodeCard from "./NodeCard";

const nodeTypes = {
  roadmapNode: NodeCard,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", marginx: 50, marginy: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 300, height: 160 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - (300 / 2),
      y: nodeWithPosition.y - (160 / 2),
    };
  });

  return { nodes, edges };
};

export default function RoadmapGraph({ nodes: initialNodes, edges: initialEdges, onNodeClick }: any) {
  
  const layouted = useMemo(() => {
    const formattedNodes = initialNodes.map((n: any) => ({
      id: n.id,
      type: "roadmapNode",
      data: { label: n.label, description: n.description },
      position: { x: 0, y: 0 },
    }));

    const formattedEdges = initialEdges.map((e: any) => ({
      id: `e${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: true,
      style: { stroke: "#ff6b00", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#ff6b00" },
    }));

    return getLayoutedElements(formattedNodes, formattedEdges);
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full min-h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node)}
        fitView
      >
        <Background color="#121216" gap={50} variant={"lines" as any} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
