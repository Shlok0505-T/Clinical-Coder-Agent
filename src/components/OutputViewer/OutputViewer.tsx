import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { AgentStep } from '../../types/discharge.types';

interface OutputViewerProps {
  steps: AgentStep[];
  isVisible: boolean;
}

const formatAgentName = (name: string): string => {
  switch (name) {
    case 'NoteCleanerAgent': return 'Note Cleaner';
    case 'ChunkerAgent': return 'Chunker';
    case 'EmbeddingRetrieverAgent': return 'Embedding Retriever';
    case 'PrimaryCoderAgent': return 'Primary Coder';
    case 'ValidatorAgent': return 'Validator';
    case 'ExplainerAgent': return 'Explainer';
    case 'AuditFormatterAgent': return 'Audit Formatter';
    default: return name;
  }
};

const formatAgentOutput = (stepName: string, output: any): string => {
  if (!output || typeof output !== 'object') {
    return 'No output available';
  }
  switch (stepName) {
    case 'NoteCleanerAgent':
      return output.cleaned_note || 'No cleaned note available';
    case 'ChunkerAgent':
      return output.chunks ? output.chunks.join('\n---\n') : 'No chunks available';
    case 'EmbeddingRetrieverAgent':
      return output.retrieved_codes ? output.retrieved_codes.map((c: any) => `• ${c.code}: ${c.description}`).join('\n') : 'No code candidates found';
    case 'PrimaryCoderAgent':
      return output.suggested_codes ? output.suggested_codes.map((c: any) => `• ${c.code}: ${c.description}`).join('\n') : 'No suggested codes';
    case 'ValidatorAgent':
      return output.validation_results ? JSON.stringify(output.validation_results, null, 2) : 'No validation results';
    case 'ExplainerAgent':
      return output.explanations ? output.explanations.map((e: any) => `• ${e.code}: ${e.layperson} (Audit: ${e.audit})`).join('\n') : 'No explanations';
    case 'AuditFormatterAgent':
      return output.audit_output ? JSON.stringify(output.audit_output, null, 2) : JSON.stringify(output, null, 2);
    default:
      return JSON.stringify(output, null, 2);
  }
};

export const OutputViewer: React.FC<OutputViewerProps> = ({ steps, isVisible }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  if (!isVisible) return null;
  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };
  const completedSteps = steps.filter(step => step.status === 'completed' && step.output);
  if (completedSteps.length === 0) {
    return (
      <div className="output-section">
        <h2 className="text-lg font-semibold mb-4">Agent Outputs</h2>
        <p className="text-gray-500 text-center py-8">
          No outputs available yet. Start the flow to see agent results.
        </p>
      </div>
    );
  }
  return (
    <div className="output-section">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Agent Outputs</h2>
      </div>
      <div className="space-y-4">
        {completedSteps.map((step) => (
          <div key={step.id} className="output-item">
            <div className="output-header">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <h3 className="font-medium">{formatAgentName(step.name)}</h3>
              </div>
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => toggleExpanded(step.id)}
              >
                {expandedSteps.has(step.id) ? (
                  <>
                    <ChevronUp size={16} />
                    Hide Output
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show Output
                  </>
                )}
              </button>
            </div>
            {expandedSteps.has(step.id) && (
              <div className="output-content">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {formatAgentOutput(step.name, step.output)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
      {completedSteps.length > 0 && (
        <div className="mt-4 text-center">
          <button
            className="btn btn-secondary flex items-center gap-2 mx-auto"
            onClick={() => {
              const allExpanded = completedSteps.every(step => expandedSteps.has(step.id));
              if (allExpanded) {
                setExpandedSteps(new Set());
              } else {
                setExpandedSteps(new Set(completedSteps.map(step => step.id)));
              }
            }}
          >
            {completedSteps.every(step => expandedSteps.has(step.id)) ? (
              <>
                <ChevronUp size={16} />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Expand All
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
