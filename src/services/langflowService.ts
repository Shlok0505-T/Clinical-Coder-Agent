import axios from 'axios';
import type { CodingInput } from '../types/discharge.types';

const BASE_URL = '';
const FLOW_ID = '99ecb228-9493-459d-ac2e-1aa0abe0ae48';

export class LangflowService {
  private sessionId: string;

  constructor() {
    this.sessionId = `coding_${Date.now()}`;
  }

  async runCodingFlow(input: CodingInput): Promise<any> {
    try {
      const payload = {
        input_value: JSON.stringify(input),
        output_type: "chat",
        input_type: "chat",
        session_id: this.sessionId
      };

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        `${BASE_URL}/api/v1/run/${FLOW_ID}`,
        payload,
        options
      );

      return response.data;
    } catch (error) {
      console.error('Error running coding flow:', error);
      throw error;
    }
  }

  private extractAgentOutputs(langflowResponse: any): any[] {
    let outputs = [];
    if (langflowResponse.outputs && langflowResponse.outputs[0] && langflowResponse.outputs[0].outputs) {
      outputs = langflowResponse.outputs[0].outputs;
    } else if (langflowResponse.outputs) {
      outputs = langflowResponse.outputs;
    } else {
      return [];
    }

    const steps = [
      'NoteCleanerAgent',
      'ChunkerAgent',
      'EmbeddingRetrieverAgent',
      'PrimaryCoderAgent',
      'ValidatorAgent',
      'ExplainerAgent'
    ];

    const parsedOutputs: any[] = [];
    outputs.forEach((output: any) => {
      const text = output.results?.message?.text || output.outputs?.message?.message || '';
      try {
        const lines = text.split('\n');
        let cleanLines = [...lines];
        if (cleanLines[0] && cleanLines[0].trim().startsWith('```')) {
          cleanLines = cleanLines.slice(1);
        }
        if (cleanLines[cleanLines.length - 1] && cleanLines[cleanLines.length - 1].trim() === '```') {
          cleanLines = cleanLines.slice(0, -1);
        }
        const cleanText = cleanLines.join('\n').trim();
        const parsedOutput = JSON.parse(cleanText);
        parsedOutputs.push(parsedOutput);
      } catch (e) {
        parsedOutputs.push({ raw_text: text });
      }
    });

    const matchedOutputs: any[] = new Array(steps.length).fill(null);
    parsedOutputs.forEach((output) => {
      const keys = Object.keys(output);
      if (keys.includes('cleaned_note')) {
        matchedOutputs[0] = output; // NoteCleanerAgent
      } else if (keys.includes('chunks')) {
        matchedOutputs[1] = output; // ChunkerAgent
      } else if (keys.includes('retrieved_codes')) {
        matchedOutputs[2] = output; // EmbeddingRetrieverAgent
      } else if (keys.includes('suggested_codes')) {
        matchedOutputs[3] = output; // PrimaryCoderAgent
      } else if (keys.includes('validation_results')) {
        matchedOutputs[4] = output; // ValidatorAgent
      } else if (keys.includes('explanations')) {
        matchedOutputs[5] = output; // ExplainerAgent
      }
    });

    return matchedOutputs.map((output, index) =>
      output || { message: `No output found for ${steps[index]}` }
    );
  }

  async simulateStepProgress(
    input: CodingInput,
    onStepUpdate: (stepIndex: number, status: string, output?: any) => void
  ): Promise<any> {
    const steps = [
      'NoteCleanerAgent',
      'ChunkerAgent',
      'EmbeddingRetrieverAgent',
      'PrimaryCoderAgent',
      'ValidatorAgent',
      'ExplainerAgent'
    ];

    try {
      onStepUpdate(0, 'running');
      const finalResult = await this.runCodingFlow(input);
      const agentOutputs = this.extractAgentOutputs(finalResult);
      for (let i = 0; i < steps.length; i++) {
        onStepUpdate(i, 'running');
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        onStepUpdate(i, 'completed', agentOutputs[i]);
      }
      return finalResult;
    } catch (error) {
      throw error;
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  resetSession(): void {
    this.sessionId = `coding_${Date.now()}`;
  }
}

export const langflowService = new LangflowService();
