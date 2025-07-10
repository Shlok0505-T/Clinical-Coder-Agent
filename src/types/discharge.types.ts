export interface CodingInput {
  id: string;
  role: string;
  content: {
    note_text: string;
    metadata?: Record<string, any>;
  };
}

export interface AgentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
}

export interface FlowState {
  isRunning: boolean;
  currentStep: number;
  steps: AgentStep[];
  finalOutput?: any;
}

export const AGENT_STEPS: AgentStep[] = [
  { id: 'cleaner', name: 'NoteCleanerAgent', status: 'pending' },
  { id: 'chunker', name: 'ChunkerAgent', status: 'pending' },
  { id: 'retriever', name: 'EmbeddingRetrieverAgent', status: 'pending' },
  { id: 'coder', name: 'PrimaryCoderAgent', status: 'pending' },
  { id: 'validator', name: 'ValidatorAgent', status: 'pending' },
  { id: 'explainer', name: 'ExplainerAgent', status: 'pending' },
  { id: 'audit', name: 'AuditFormatterAgent', status: 'pending' }
];

export const DEFAULT_INPUT: CodingInput = {
  id: 'note-001',
  role: 'user',
  content: {
    note_text: 'Patient presents with chest pain and shortness of breath. ECG and troponin ordered. No prior cardiac history.',
    metadata: {}
  }
};
