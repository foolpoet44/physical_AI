
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { OntologyData, OntologyNode, OntologyLink, LAYER_COLORS } from '../types';

interface GraphViewProps {
  data: OntologyData;
  onNodeSelect: (node: OntologyNode | null) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Simulation setup
    const simulation = d3.forceSimulation<any>(data.nodes as any)
      .force("link", d3.forceLink<any, any>(data.links as any).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Links
    const link = g.append("g")
      .attr("stroke", "#333")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 1.5);

    // Nodes
    const node = g.append("g")
      .selectAll(".node")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on("click", (event, d) => {
        onNodeSelect(d as OntologyNode);
        event.stopPropagation();
      });

    // Node circles
    node.append("circle")
      .attr("r", 12)
      .attr("fill", d => LAYER_COLORS[d.group] || "#999")
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-transform hover:scale-125");

    // Node labels
    node.append("text")
      .text(d => d.label)
      .attr("x", 16)
      .attr("y", 4)
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .attr("class", "font-sans drop-shadow-md");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0d0d0d] relative overflow-hidden rounded-lg border border-white/10" onClick={() => onNodeSelect(null)}>
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-black/50 p-3 rounded-md border border-white/5 pointer-events-none">
            {Object.entries(LAYER_COLORS).map(([group, color]) => (
                <div key={group} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        {group === '1' ? 'Foundation' : group === '2' ? 'Core Robotics' : group === '3' ? 'Physical AI' : 'Vibe'}
                    </span>
                </div>
            ))}
        </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default GraphView;
