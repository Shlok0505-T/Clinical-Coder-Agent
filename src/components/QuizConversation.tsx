import React from 'react';

interface Interaction {
  step: string;
  message_content: string;
  patient_response?: string;
  correct?: boolean;
  clarification?: string;
  confirmed_understanding?: boolean;
}

interface QuizConversationProps {
  interactionLog: Interaction[];
}

export const QuizConversation: React.FC<QuizConversationProps> = ({ interactionLog }) => {
  if (!interactionLog || interactionLog.length === 0) {
    return null;
  }

  return (
    <div className="output-section">
      <div className="chat-container">
        <div>
          {interactionLog.map((interaction, index) => (
            <div key={index}>
              {/* System Message - Left Side */}
              <div className="chat-message chat-message-left">
                <div className="chat-bubble chat-bubble-left">
                  <div className="text-xs opacity-75 mb-2">System</div>
                  <div>{interaction.message_content}</div>
                </div>
              </div>
              {/* Clarification - Left Side */}
              {interaction.clarification && (
                <div className="chat-message chat-message-left">
                  <div className="chat-bubble chat-bubble-correction">
                    <div className="text-xs opacity-75 mb-2">Correction</div>
                    <div>{interaction.clarification}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
