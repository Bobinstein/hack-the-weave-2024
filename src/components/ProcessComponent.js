// src/components/ProcessComponent.js
import React from 'react';
import Link from 'next/link';


const ProcessComponent = ({ process }) => {
  const nameTag = process.tags.find(tag => tag.name === "Name");

  // Format the process ID
  const formattedId = `${process.id.slice(0, 5)}...${process.id.slice(-5)}`;

  // Assuming the process-specific page will use the ID in the URL
  const processLink = `/process/${process.id}`;

  return (
    <Link href={processLink} passHref legacyBehavior>
      <a style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        margin: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        // width: '20%',
        minWidth: '150px',
        maxWidth: '20%',
        textDecoration: 'none', // Remove underline from link
        textAlign: "center",
        color: 'inherit' // Inherit the text color from the parent
      }}>
        <span style={{ fontWeight: 'bold', marginBottom: '8px' }}>{nameTag.value}</span>
        <span>{formattedId}</span>
      </a>
    </Link>
  );
};

export default ProcessComponent;
