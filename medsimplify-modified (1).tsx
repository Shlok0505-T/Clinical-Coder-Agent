import React, { useState } from 'react';
import { MessageCircle, Zap, BarChart3, User, Calendar, Hash, FileText, Upload, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MedSimplifyAI = () => {
  const [medicalText, setMedicalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalMessages: 1,
    textsProcessed: 0,
    averageReadingLevel: 0
  });
  const [patientInfo, setPatientInfo] = useState({
    id: '',
    name: '',
    dob: '',
    gender: ''
  });
  const [simplificationLevel, setSimplificationLevel] = useState('moderate');
  const [targetAudience, setTargetAudience] = useState('general');

  const simplificationLevels = [
    { value: 'basic', label: 'Basic', description: 'Elementary school level (Grade 3-5)' },
    { value: 'moderate', label: 'Moderate', description: 'Middle school level (Grade 6-8)' },
    { value: 'advanced', label: 'Advanced', description: 'High school level (Grade 9-12)' }
  ];

  const targetAudiences = [
    { value: 'general', label: 'General Patient', description: 'Average adult patient' },
    { value: 'elderly', label: 'Elderly Patient', description: 'Senior citizens with simpler language needs' },
    { value: 'pediatric', label: 'Pediatric/Family', description: 'Parents or guardians of young patients' }
  ];

  const handleSimplify = async () => {
    if (!medicalText.trim()) {
      alert('Please enter medical text to simplify');
      return;
    }

    setIsLoading(true);
    
    try {
      const startTime = Date.now();
      
      // Call your actual Langflow API for text simplification
      const response = await fetch('/api/v1/run/http://74.225.219.71/flow/99ecb228-9493-459d-ac2e-1aa0abe0ae48', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_value: medicalText,
          input_type: 'chat',
          output_type: 'chat',
          tweaks: {
            simplification_level: simplificationLevel,
            target_audience: targetAudience,
            patient_id: patientInfo.id || 'unknown',
            patient_name: patientInfo.name || 'unknown',
            patient_dob: patientInfo.dob || 'unknown',
            patient_gender: patientInfo.gender || 'unknown'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;
      
      // Parse the response from your Langflow workflow
      const parsedResponse = parseLangflowResponse(data);
      
      setSimplifiedText(parsedResponse.simplifiedText);
      setSessionStats(prev => ({
        ...prev,
        textsProcessed: prev.textsProcessed + 1,
        averageReadingLevel: parsedResponse.readingLevel || 8
      }));
      
    } catch (error) {
      console.error('Simplification error:', error);
      
      // Show specific error messages
      if (error.message.includes('404')) {
        alert('Medical text simplification workflow not found. Please check your Langflow setup.');
      } else if (error.message.includes('500')) {
        alert('Server error in simplification workflow. Please try again.');
      } else {
        alert(`Error simplifying medical text: ${error.message}`);
      }
      
      // Fallback to mock simplification for demonstration
      console.log('Falling back to mock simplification for demonstration');
      const mockSimplified = generateMockSimplification(medicalText, simplificationLevel);
      setSimplifiedText(mockSimplified);
      setSessionStats(prev => ({
        ...prev,
        textsProcessed: prev.textsProcessed + 1,
        averageReadingLevel: simplificationLevel === 'basic' ? 4 : simplificationLevel === 'moderate' ? 7 : 10
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse Langflow response
  const parseLangflowResponse = (data) => {
    try {
      const outputs = data.outputs || [];
      const firstOutput = outputs[0];
      
      if (!firstOutput || !firstOutput.outputs) {
        throw new Error('Invalid response structure from Langflow');
      }

      const agentOutputs = firstOutput.outputs;
      let simplifiedText = '';
      let readingLevel = 8;
      
      if (agentOutputs.length > 0) {
        const finalOutput = agentOutputs[agentOutputs.length - 1];
        
        if (typeof finalOutput.results === 'string') {
          try {
            const parsedData = JSON.parse(finalOutput.results);
            simplifiedText = parsedData.simplified_text || parsedData.text || finalOutput.results;
            readingLevel = parsedData.reading_level || 8;
          } catch {
            simplifiedText = finalOutput.results;
          }
        } else {
          simplifiedText = finalOutput.results?.simplified_text || finalOutput.results?.text || 'Error processing text';
        }
      }
      
      return {
        simplifiedText,
        readingLevel
      };
    } catch (error) {
      console.error('Error parsing Langflow response:', error);
      throw new Error('Failed to parse simplification results from workflow');
    }
  };

  // Mock simplification for demonstration
  const generateMockSimplification = (text, level) => {
    const complexTerms = {
      'hypertension': 'high blood pressure',
      'myocardial infarction': 'heart attack',
      'cerebrovascular accident': 'stroke',
      'diabetes mellitus': 'diabetes',
      'pneumonia': 'lung infection',
      'exacerbated': 'made worse',
      'alleviated': 'made better',
      'administered': 'given',
      'cardiovascular': 'heart and blood vessel',
      'pulmonary': 'lung',
      'gastrointestinal': 'stomach and intestine',
      'bilateral': 'on both sides',
      'unilateral': 'on one side',
      'acute': 'sudden',
      'chronic': 'long-term'
    };

    let simplified = text;
    
    // Replace complex terms with simpler ones
    Object.entries(complexTerms).forEach(([complex, simple]) => {
      const regex = new RegExp(complex, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    // Add explanation prefix based on level
    if (level === 'basic') {
      simplified = `Here's what this means in simple terms:\n\n${simplified}`;
    } else if (level === 'moderate') {
      simplified = `Here's a clearer explanation:\n\n${simplified}`;
    }

    return simplified;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMedicalText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setMedicalText('');
    setSimplifiedText('');
  };

  const handleTest = () => {
    const sampleText = `The patient was evaluated in the office today for complaints of low back pain for the past two weeks. The patient reports no history of trauma. The pain is exacerbated by sitting and alleviated by movement. The patient denies fever and paresthesia. Physical examination reveals tenderness to palpation over the lumbar spine with limited range of motion. Assessment and plan: Acute lumbar strain. Recommend NSAIDs, physical therapy, and follow-up in two weeks if symptoms persist.`;
    setMedicalText(sampleText);
  };

  const downloadResults = () => {
    if (!simplifiedText) return;
    
    const results = {
      originalText: medicalText,
      simplifiedText: simplifiedText,
      simplificationLevel: simplificationLevel,
      targetAudience: targetAudience,
      patientInfo: patientInfo,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `simplified-medical-text-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MedSimplify AI</h1>
                <p className="text-purple-100">Medical Text Simplification Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-purple-100">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information - Moved to top */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                  <input
                    type="text"
                    value={patientInfo.id}
                    onChange={(e) => setPatientInfo({...patientInfo, id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={patientInfo.dob}
                    onChange={(e) => setPatientInfo({...patientInfo, dob: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="h-6 w-6 mr-3 text-purple-600" />
                  Medical Text Simplification
                </h2>
                <label className="flex items-center space-x-2 cursor-pointer bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors">
                  <Upload className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Upload File</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={medicalText}
                onChange={(e) => setMedicalText(e.target.value)}
                placeholder="Enter or paste medical text here that you'd like me to simplify for better patient communication..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {medicalText.length} characters
                </span>
                <button
                  onClick={handleSimplify}
                  disabled={isLoading || !medicalText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Simplifying...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      <span>Simplify</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simplified Text Result */}
            {simplifiedText && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Simplified Version
                  </h3>
                  <button
                    onClick={downloadResults}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 rounded-full px-3 py-1 text-sm font-medium text-green-800">
                      SIMPLIFIED VERSION
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {simplifiedText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enter Patient Info</h4>
                    <p className="text-sm text-gray-600">Fill in the patient details for personalized simplification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Input Medical Text</h4>
                    <p className="text-sm text-gray-600">Paste or type complex medical text that needs simplification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">AI Processing</h4>
                    <p className="text-sm text-gray-600">Our AI analyzes and converts medical jargon into plain language</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Results</h4>
                    <p className="text-sm text-gray-600">Receive patient-friendly text ready for clear communication</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default MedSimplifyAI;
