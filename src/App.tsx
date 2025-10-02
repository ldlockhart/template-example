import React, { useState, useEffect } from 'react';
import './App.css';
import BeefreeEditor from './BeefreeEditor';

// --- MOCK DATA ---
// In a real application, this data would come from the database via an API call.
// These are placeholder JSON objects only
const MOCK_TEMPLATE_1 = {
  "page": {
    "description": "My First Template",
    "rows": [
      {
        "columns": [
          {
            "grid-columns": 12,
            "modules": [
              {
                "type": "mailup-bee-newsletter-modules-text",
                "descriptor": {
                  "text": {
                    "html": "<p>This is Template 1.</p>",
                    "style": { "color": "#000000" }
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
};

const MOCK_TEMPLATE_2 = {
  "page": {
    "description": "My Second Template",
    "rows": [
       {
        "columns": [
          {
            "grid-columns": 12,
            "modules": [
              {
                "type": "mailup-bee-newsletter-modules-text",
                "descriptor": {
                  "text": {
                    "html": "<p>This is the awesome second template!</p>",
                    "style": { "color": "#3f51b5" }
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
};

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

  const [template, setTemplate] = useState<object | null>(null);s
  useEffect(() => {
    console.log("Fetching initial template from our backend...");
    setTemplate(MOCK_TEMPLATE_1);
  }, []);
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
