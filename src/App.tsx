import React, { useState, useEffect } from 'react';
import './App.css';
import BeefreeEditor from './BeefreeEditor';

// --- MOCK DATA ---
// In a real application, this data would come from your database via an API call.
// These are placeholder objects. You would replace them with actual Beefree JSON templates.
const MOCK_TEMPLATE_1 = {
  "page": { "description": "My Template 1", "rows": [] }
};
const MOCK_TEMPLATE_2 = {
  "page": { "description": "My Template 2 - A different design", "rows": [] }
};
// -----------------

function DocsButton() {
  return (
    <a
      href="https://docs.beefree.io/beefree-sdk"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button style={{ padding: '10px 20px', fontSize: '16px', margin: '0 10px' }}>
        Read the Docs
      </button>
    </a>
  );
}

function App() {
  // 1. Use state to hold the current template's JSON object
  const [template, setTemplate] = useState<object | null>(null);

  // 2. This useEffect fetches the initial template when the component mounts
  useEffect(() => {
    console.log("Fetching initial template from our backend...");
    // In a real app, this would be an API call: `fetch('/api/templates/1').then(...)`
    setTemplate(MOCK_TEMPLATE_1);
  }, []); // The empty array ensures this runs only once

  // 3. This function will be passed to the editor to handle the save event
  const handleSave = (templateJson: object) => {
    console.log("Template saved! Sending updated JSON to our backend...");
    console.log(templateJson);
    // Here, you would make a POST/PUT request to your API to save the data
    // e.g., `fetch('/api/templates/1', { method: 'POST', body: JSON.stringify(templateJson) });`
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Beefree Demo</h1>
        <DocsButton />
        <div style={{ margin: '20px 0' }}>
          <p>This is your app's UI. Use these buttons to dynamically change the template loaded in the editor below.</p>
          <button style={{ padding: '10px 20px', margin: '5px' }} onClick={() => setTemplate(MOCK_TEMPLATE_1)}>Load Template 1</button>
          <button style={{ padding: '10px 20px', margin: '5px' }} onClick={() => setTemplate(MOCK_TEMPLATE_2)}>Load Template 2</button>
        </div>
      </header>
      <main>
        {/* 4. We conditionally render the editor only when the template data is ready */}
        {template ? (
          <BeefreeEditor template={template} onSave={handleSave} />
        ) : (
          <p>Loading template...</p>
        )}
      </main>
    </div>
  );
}

export default App;
