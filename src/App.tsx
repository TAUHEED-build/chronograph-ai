import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { NodeDrawer } from './components/NodeDrawer';
import { TimeTraveler } from './components/TimeTraveler';
import { JsonModal } from './components/JsonModal';
import { TemporalGraphResult, TemporalNode } from './types/chronograph';
import { extractTemporalGraphLocally } from './utils/localEngine';
import { LOG_PRESETS } from './utils/presets';

export default function App() {
  const initialPreset = LOG_PRESETS[0];

  const [inputText, setInputText] = useState<string>(initialPreset.text);
  const [graphData, setGraphData] = useState<TemporalGraphResult>(() =>
    extractTemporalGraphLocally(initialPreset.text)
  );

  const [selectedNode, setSelectedNode] = useState<TemporalNode | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(7); // Default to T7 so Vercel deploy is visible alongside the pivot!
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stageMessage, setStageMessage] = useState<string>('');
  const [useCloudGemini, setUseCloudGemini] = useState<boolean>(true);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  // Probe API status on mount
  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setApiConnected(Boolean(data.hasApiKey));
        } else {
          setApiConnected(false);
        }
      } catch (err) {
        setApiConnected(false);
      }
    }
    checkApi();
  }, []);

  // Extraction logic with fallback
  const handleExtract = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setStageMessage('Tokenizing temporal anchors & entities...');

    // Simulate multi-stage telemetry steps for responsive UX
    const stageTimer1 = setTimeout(() => {
      setStageMessage('Resolving entity validity windows & decay horizons...');
    }, 400);

    const stageTimer2 = setTimeout(() => {
      setStageMessage('Computing context drift tensors & goal pivot vectors...');
    }, 900);

    try {
      if (useCloudGemini) {
        // Attempt full-stack Gemini API extraction
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.data && !json.fallback) {
            setGraphData(json.data);
            setCurrentStep(json.data.timeline?.length ? Math.min(7, json.data.timeline.length) : 7);
            setIsProcessing(false);
            clearTimeout(stageTimer1);
            clearTimeout(stageTimer2);
            return;
          }
        }
      }

      // Local engine fallback
      setTimeout(() => {
        const localResult = extractTemporalGraphLocally(inputText);
        setGraphData(localResult);
        setCurrentStep(localResult.timeline.length ? Math.min(7, localResult.timeline.length) : 7);
        setIsProcessing(false);
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
      }, 1100);
    } catch (error) {
      console.warn('Falling back to local heuristic extraction:', error);
      const localResult = extractTemporalGraphLocally(inputText);
      setGraphData(localResult);
      setCurrentStep(7);
      setIsProcessing(false);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
    }
  }, [inputText, useCloudGemini]);

  // Reset to prompt initial state
  const handleReset = () => {
    setInputText(initialPreset.text);
    const initialResult = extractTemporalGraphLocally(initialPreset.text);
    setGraphData(initialResult);
    setSelectedNode(null);
    setCurrentStep(7);
  };

  // Node selection handler
  const handleSelectNode = (node: TemporalNode | null) => {
    setSelectedNode(node);
  };

  // Counts for the currently active time step
  const activeCount = graphData.nodes.filter(
    (n) => n.step <= currentStep && n.status === 'active'
  ).length;

  const decayedCount = graphData.nodes.filter(
    (n) => n.step <= currentStep && (n.status === 'decayed' || n.status === 'superseded')
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* 1. Top Header */}
      <Header
        useCloudGemini={useCloudGemini}
        setUseCloudGemini={setUseCloudGemini}
        apiConnected={apiConnected}
        onReset={handleReset}
        onOpenJson={() => setIsJsonModalOpen(true)}
        isProcessing={isProcessing}
      />

      {/* 2. Middle Main Workspace (Left Panel + Graph Simulator) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Left Panel: Control, Logs, Metrics */}
        <ControlPanel
          inputText={inputText}
          setInputText={setInputText}
          onExtract={handleExtract}
          isProcessing={isProcessing}
          metrics={graphData.metrics}
          useCloudGemini={useCloudGemini}
          stageMessage={stageMessage}
        />

        {/* Right Panel: Interactive Graph Canvas Simulator */}
        <div className="flex-1 h-full relative overflow-hidden flex flex-col">
          <GraphCanvas
            nodes={graphData.nodes}
            edges={graphData.edges}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            onSelectNode={handleSelectNode}
            currentStep={currentStep}
          />

          {/* Node Inspector Slide-over Drawer */}
          {selectedNode && (
            <NodeDrawer
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              allNodes={graphData.nodes}
              edges={graphData.edges}
              onSelectNode={handleSelectNode}
            />
          )}
        </div>
      </div>

      {/* 3. Bottom Panel: Time-Travel Controls (T1 to T10) */}
      <TimeTraveler
        timeline={graphData.timeline}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        maxStep={10}
        activeCount={activeCount}
        decayedCount={decayedCount}
      />

      {/* 4. Raw Strict Schema JSON Modal */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        graphData={graphData}
      />
    </div>
  );
}
