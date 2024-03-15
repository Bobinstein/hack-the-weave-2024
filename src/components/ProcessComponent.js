// src/components/ProcessComponent.js
import React from 'react';

const ProcessComponent = ({ process }) => {
  const nameTag = process.tags.find(tag => tag.name === "Name");

  // Format the process ID
  const formattedId = `${process.id.slice(0, 5)}...${process.id.slice(-5)}`;

  const handleClick = () => {
    window.location.hash = `process/${process.id}`;
  };

  return (
    <div onClick={handleClick} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      margin: '25px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      minWidth: '20%',
      maxWidth: '20%',
      textDecoration: 'none',
      textAlign: "center",
      color: 'inherit',
      cursor: 'pointer'  // Make it clear this is clickable
    }}>
      <span style={{ fontWeight: 'bold', marginBottom: '8px' }}>{nameTag.value}</span>
      <span>{formattedId}</span>
    </div>
  );
};

export default ProcessComponent;
