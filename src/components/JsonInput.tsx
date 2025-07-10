import React, { useState } from 'react';
import { Play, FileText, User, Calendar, Hash, ChevronDown } from 'lucide-react';
import type { CodingInput } from '../types/discharge.types';

interface JsonInputProps {
  onSubmit: (input: CodingInput) => void;
  isLoading: boolean;
}

const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const JsonInput: React.FC<JsonInputProps> = ({ onSubmit, isLoading }) => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
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
        metadata: {
          patient_id: patientId,
          patient_name: patientName,
          date_of_birth: dob,
          gender: gender,
        },
      },
    };
    onSubmit(codingInput);
  };

  return (
    <div className="input-section" style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(80,80,120,0.07)', padding: 32, marginBottom: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#4b2994' }}>
        <User size={24} style={{ color: '#4b2994' }} />
        Patient Information
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontWeight: 600, color: '#4b2994', marginBottom: 6, display: 'block' }}>
              <Hash size={16} style={{ marginRight: 4 }} /> Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fafaff' }}
              placeholder="Enter patient ID"
              autoComplete="off"
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, color: '#4b2994', marginBottom: 6, display: 'block' }}>
              <User size={16} style={{ marginRight: 4 }} /> Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fafaff' }}
              placeholder="Enter patient name"
              autoComplete="off"
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontWeight: 600, color: '#4b2994', marginBottom: 6, display: 'block' }}>
              <Calendar size={16} style={{ marginRight: 4 }} /> Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={dob}
              onChange={e => setDob(e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fafaff' }}
              placeholder="dd-mm-yyyy"
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, color: '#4b2994', marginBottom: 6, display: 'block' }}>
              <ChevronDown size={16} style={{ marginRight: 4 }} /> Gender
            </label>
            <select
              name="gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, border: '1px solid #e0e0e0', borderRadius: 10, background: '#fafaff' }}
            >
              {genderOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
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
