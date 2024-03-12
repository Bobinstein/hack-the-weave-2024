// src/components/aoMessages.js
import React, { useState } from 'react';

const AoMessage = ({ message }) => {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const toggleMessageDisplay = () => setShowFullMessage(!showFullMessage);

  const firstMessageData = message.Messages.length > 0 ? message.Messages[0].Data : "No message data";

  return (
    <div 
      onClick={toggleMessageDisplay}
      style={{
        cursor: 'pointer',
        margin: '10px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        maxWidth: '300px',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap', // Ensures pre-formatted text is wrapped
        overflowWrap: 'break-word',
        overflowX: 'hidden' // Prevents horizontal overflow
      }}
    >
      {showFullMessage ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(message, null, 2)}</pre>
      ) : (
        <span>{firstMessageData}</span>
      )}
    </div>
  );
};

const AoMessages = ({ messages }) => (
  <div style={{ maxWidth: '300px', overflowY: 'auto' }}>
    {messages.map((message, index) => (
      <AoMessage key={index} message={message} />
    ))}
  </div>
);

export default AoMessages;
