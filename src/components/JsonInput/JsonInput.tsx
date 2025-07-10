import React, { useState } from 'react';
import { Play, FileText } from 'lucide-react';
import type { CodingInput } from '../../types/discharge.types';

interface JsonInputProps {
  onSubmit: (input: CodingInput) => void;
  isLoading: boolean;
}

export const JsonInput: React.FC<JsonInputProps> = ({ onSubmit, isLoading }) => {
  const [noteText, setNoteText] = useState('Patient presents with chest pain and shortness of breath. ECG and troponin ordered. No prior cardiac history.');

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codingInput: CodingInput = {
      id: generateId(),
      role: 'user',
      content: {
        note_text: noteText,
        metadata: {}, // No patient info
      },
    };
    onSubmit(codingInput);
  };

  return (
    <div className="input-section" style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(80,80,120,0.07)', padding: 32, marginBottom: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#4b2994' }}>
        <FileText size={24} style={{ color: '#4b2994' }} />
        Clinical Note
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ marginTop: 10 }}>
          <label style={{ fontWeight: 600, color: '#4b2994', marginBottom: 6, display: 'block' }}>
            <FileText size={16} style={{ marginRight: 4 }} /> Clinical Note Text
          </label>
          <textarea
            name="noteText"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            style={{ width: '100%', padding: 14, fontSize: 16, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fafaff', minHeight: 120, resize: 'vertical' }}
            placeholder="Enter or paste medical note here for coding..."
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary flex items-center gap-2"
          disabled={isLoading}
          style={{ background: 'linear-gradient(90deg, #7b47e1 0%, #a084ee 100%)', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 10, padding: '12px 0', marginTop: 10, boxShadow: '0 2px 8px rgba(80,80,120,0.07)' }}
        >
          <Play size={18} />
          {isLoading ? 'Processing...' : 'Start Coding'}
        </button>
      </form>
    </div>
  );
};
