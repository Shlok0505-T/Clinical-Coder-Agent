import { useState } from 'react';
import { Download } from 'lucide-react';
import { JsonInput } from './components/JsonInput/JsonInput';
import { AgentProgress } from './components/AgentProgress/AgentProgress';
import { OutputViewer } from './components/OutputViewer/OutputViewer';
import { PdfGenerator } from './components/PdfGenerator/PdfGenerator';
import { langflowService } from './services/langflowService';
import type { CodingInput, AgentStep, FlowState } from './types/discharge.types';
import { AGENT_STEPS } from './types/discharge.types';
import './globals.css';

function App() {
  const [flowState, setFlowState] = useState<FlowState>({
    isRunning: false,
    currentStep: 0,
    steps: [...AGENT_STEPS],
    finalOutput: null
  });

  const handleStepUpdate = (stepIndex: number, status: string, output?: any) => {
    setFlowState(prev => ({
      ...prev,
      currentStep: stepIndex,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { ...step, status: status as AgentStep['status'], output }
          : step
      )
    }));
  };

  const handleStartFlow = async (input: CodingInput) => {
    try {
      setFlowState({
        isRunning: true,
        currentStep: 0,
        steps: AGENT_STEPS.map(step => ({ ...step, status: 'pending' })),
        finalOutput: null
      });
      const result = await langflowService.simulateStepProgress(
        input,
        handleStepUpdate
      );
      setFlowState(prev => ({
        ...prev,
        isRunning: false,
        finalOutput: result
      }));
    } catch (error) {
      setFlowState(prev => ({
        ...prev,
        isRunning: false,
        steps: prev.steps.map((step, index) => 
          index === prev.currentStep 
            ? { ...step, status: 'error', error: 'Failed to execute' }
            : step
        )
      }));
    }
  };

  const handleReset = () => {
    langflowService.resetSession();
    setFlowState({
      isRunning: false,
      currentStep: 0,
      steps: [...AGENT_STEPS],
      finalOutput: null
    });
  };

  const downloadJSON = (output: any) => {
    if (!output) {
      alert('No data available for download');
      return;
    }
    const filename = `CodingOutput_${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(output, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="header">
        <div className="container">
          <h1>Clinical Coding Agent</h1>
        </div>
      </div>
      <div className="container">
        <JsonInput 
          onSubmit={handleStartFlow}
          isLoading={flowState.isRunning}
        />
        <AgentProgress 
          steps={flowState.steps}
          isVisible={flowState.isRunning || flowState.steps.some(s => s.status !== 'pending')}
        />
        <OutputViewer 
          steps={flowState.steps}
          isVisible={flowState.steps.some(s => s.status === 'completed')}
        />
        {!flowState.isRunning && flowState.steps.some(s => s.status !== 'pending') && (
          <div className="w-full flex items-center justify-between mb-6 px-4">
            {(() => {
              const explainerStep = flowState.steps.find(step => step.name === 'ExplainerAgent');
              const explainerOutput = explainerStep?.output;
              return explainerOutput ? (
                <PdfGenerator 
                  codingOutput={explainerOutput}
                />
              ) : null;
            })()}
            {(() => {
              const explainerStep = flowState.steps.find(step => step.name === 'ExplainerAgent');
              return explainerStep?.output ? (
                <button
                  className="btn flex items-center gap-2"
                  style={{ 
                    backgroundColor: '#25255e', 
                    color: 'white', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '12px', 
                    marginLeft: '0.5rem',
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 16px rgba(37, 37, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 37, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.backgroundColor = '#2f2f6e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 37, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.backgroundColor = '#25255e';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onClick={() => downloadJSON(explainerStep.output)}
                >
                  <Download size={16} />
                  Download JSON
                </button>
              ) : null;
            })()}
          </div>
        )}
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
        >
          Reset Flow
        </button>
      </div>
    </div>
  );
}

export default App;
