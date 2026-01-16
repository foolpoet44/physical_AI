
import React, { useState, useCallback } from 'react';
import { generateOntology } from './services/geminiService';
import { OntologyData, OntologyNode, LAYER_LABELS, LAYER_COLORS } from './types';
import GraphView from './components/GraphView';

const DEFAULT_RAW_DATA = `
Layer 1: Foundations
- Mathematics (Linear Algebra, Calculus)
- Classical Physics & Mechanics
- Programming (Python, C++)
- Data Structures & Algorithms

Layer 2: Core Robotics
- ROS2 (Robot Operating System)
- SLAM (Simultaneous Localization and Mapping)
- Perception (Computer Vision, Point Clouds)
- Control Theory (PID, MPC)
- Actuators and Sensors

Layer 3: Physical AI
- Sim-to-Real Transfer
- Deep Reinforcement Learning
- Robot Foundation Models (RT-1, RT-2, GATO)
- Multi-modal Transformers
- Embodied Intelligence

Layer 4: Vibe (Competencies)
- Safety Awareness (Compliance with ISO 10218-1/2)
- Collaborative Problem Solving
- Ethical AI Stewardship
- Systems Thinking
- Adaptability in Dynamic Environments

Relationship Highlights:
- ROS2 is built on Python and C++.
- Sim-to-Real depends on Physics and Mechanics.
- Safety Awareness is critical when deploying Collaborative Robots (Layer 2).
- Ethics connects to how Foundation Models make autonomous decisions.
- Systems Thinking links Core Robotics with Physical AI architectures.
`;

const App: React.FC = () => {
  const [rawData, setRawData] = useState(DEFAULT_RAW_DATA);
  const [ontology, setOntology] = useState<OntologyData | null>(null);
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateOntology(rawData);
      setOntology(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = useCallback(() => {
    if (!ontology) return;
    const blob = new Blob([JSON.stringify(ontology, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physical_ai_ontology.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [ontology]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar: Inputs */}
      <div className="w-1/3 min-w-[400px] flex flex-col border-r border-white/10 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <span className="text-blue-500">Physical AI</span> Architect
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Ontology & Capability Modeler</p>
        </div>

        <div className="space-y-4 flex-grow flex flex-col">
          <div className="flex flex-col gap-2 flex-grow">
            <label className="text-sm font-semibold text-gray-400">Raw Data Input</label>
            <textarea
              className="w-full flex-grow bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Paste competency layers here..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !rawData.trim()}
            className={`w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              loading 
                ? 'bg-gray-800 cursor-not-allowed text-gray-500' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing & Constructing...
              </>
            ) : (
              'Generate Ontology Graph'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5">
          <h3 className="text-xs font-mono uppercase text-gray-500 mb-4">Selected Competency</h3>
          {selectedNode ? (
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LAYER_COLORS[selectedNode.group] }}></div>
                <span className="text-[10px] font-mono uppercase text-gray-400">{LAYER_LABELS[selectedNode.group]}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{selectedNode.label}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{selectedNode.description}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 italic">Select a node to view details</div>
          )}
        </div>
      </div>

      {/* Main Panel: Visualization */}
      <div className="flex-grow flex flex-col relative">
        <div className="absolute top-6 right-6 z-20 flex gap-2">
           {ontology && (
             <button
              onClick={handleExport}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium transition-colors"
            >
              Export JSON (NetworkX)
            </button>
           )}
        </div>

        <div className="flex-grow p-4">
          {ontology ? (
            <GraphView data={ontology} onNodeSelect={setSelectedNode} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-lg text-gray-600 bg-white/[0.02]">
              <div className="w-24 h-24 mb-4 opacity-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">Ready to Model</p>
              <p className="text-sm">Click 'Generate Ontology Graph' to begin mapping competencies.</p>
            </div>
          )}
        </div>

        {ontology && (
           <div className="absolute bottom-10 right-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 max-w-xs shadow-2xl">
              <h4 className="text-xs font-mono text-blue-400 mb-2">SYSTEM ANALYTICS</h4>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Nodes:</span>
                <span>{ontology.nodes.length}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Edges:</span>
                <span>{ontology.links.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Connectivity:</span>
                <span>{(ontology.links.length / ontology.nodes.length).toFixed(2)} avg/node</span>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
