// src/components/Results.js
import React from 'react';
import sanitizeHtml from 'sanitize-html';

const Results = ({ results }) => {
  if (!results || results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div className="results-container">
      <h2>Search Results:</h2>
      <ul>
        {results.map((item, index) => {
          const rawText = item.properties?.nonRefProps?.fields?.content?.textValue || 'No text available';
          // Remove HTML tags and formatting
          const text = sanitizeHtml(rawText, { allowedTags: [], allowedAttributes: {} });
          const chunkIndex = item.properties?.nonRefProps?.fields?.chunk_index?.intValue || 'No index';
          const id = item.metadata?.id || 'No ID available';
          const score = item.metadata?.score !== undefined ? item.metadata.score.toFixed(2) : 'No score';

          return (
            <li key={index}>
              <p><strong>Chunk Index:</strong> {chunkIndex}</p>
              <p><strong>Text:</strong> {text}</p>
              <p><strong>ID:</strong> {id}</p>
              <p><strong>Score:</strong> {score}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Results;
