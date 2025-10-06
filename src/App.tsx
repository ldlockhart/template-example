import { useState, useEffect } from 'react';
import './App.css';
import BeefreeEditor from './BeefreeEditor';

// Import valid Beefree SDK templates from JSON files
// These templates contain the complete Beefree structure required by the SDK
import template1Data from '../template-1.json';
import template2Data from '../template-2.json';

/**
 * DocsButton Component
 * Renders a button that links to the official Beefree SDK documentation
 */
function DocsButton() {
  return (
    <a
      href="https://docs.beefree.io/beefree-sdk"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button style={{ padding: '10px 20px', fontSize: '16px', margin: '0 10px' }}>
        📖 Read the Docs
      </button>
    </a>
  );
}

/**
 * Main App Component
 * Manages template state and provides UI controls for loading different templates into Beefree SDK
 */
function App() {
  // State to hold the currently loaded template JSON
  // This is passed as a prop to BeefreeEditor and triggers template loading when changed
  const [template, setTemplate] = useState<object | null>(null);

  // State to track which template is currently loaded (for UI feedback)
  const [currentTemplate, setCurrentTemplate] = useState<number>(1);

  /**
   * Effect Hook - Initialize with Template 1 on Component Mount
   * This runs once when the component first renders, loading the default template
   */
  useEffect(() => {
    console.log('Initializing Beefree SDK with Template 1...');
    // Load template-1.json by default when the app starts
    setTemplate(template1Data);
    setCurrentTemplate(1);
  }, []); // Empty dependency array = runs only once on mount

  /**
   * Template Loading Handler
   * Loads a specific template into the Beefree SDK editor
   * 
   * @param templateData - The full Beefree template JSON object
   * @param templateNumber - Template identifier (1 or 2) for UI feedback
   * 
   * How it works:
   * 1. Updates the template state with new JSON
   * 2. React detects state change and re-renders BeefreeEditor
   * 3. BeefreeEditor's useEffect hook detects props.template change
   * 4. BeefreeEditor calls beeInstance.load(newTemplate) to update the builder
   */
  const loadTemplate = (templateData: object, templateNumber: number) => {
    console.log(`Loading Template ${templateNumber} into Beefree SDK...`);
    setTemplate(templateData);
    setCurrentTemplate(templateNumber);
  };

  /**
   * Save Handler
   * Called when user clicks "Save" in the Beefree SDK editor
   * Receives the updated template JSON from Beefree SDK
   * 
   * @param templateJson - The complete Beefree template JSON with user's edits
   * 
   * In a production app, you would:
   * - Send this JSON to your backend API for storage
   * - Update a database record
   * - Show success/error feedback to the user
   */
  const handleSave = (templateJson: object) => {
    console.log('Template saved! Sending updated JSON to backend...');
    console.log(templateJson);
    
    // Production example:
    // try {
    //   await fetch('/api/templates', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       id: currentTemplate,
    //       template: templateJson,
    //       updatedAt: new Date().toISOString()
    //     })
    //   });
    //   alert('Template saved successfully!');
    // } catch (error) {
    //   console.error('Save failed:', error);
    //   alert('Failed to save template');
    // }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐝 Beefree SDK Template Demo</h1>
        
        {/* Navigation and Control Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: '20px 0' 
        }}>
          <DocsButton />
          
          {/* Template Loading Buttons */}
          {/* These buttons allow switching between different templates in real-time */}
          <button 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: currentTemplate === 1 ? '#4CAF50' : '#008CBA',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: currentTemplate === 1 ? 'bold' : 'normal'
            }}
            onClick={() => loadTemplate(template1Data, 1)}
          >
            🐕 Load Template 1
          </button>
          
          <button 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: currentTemplate === 2 ? '#4CAF50' : '#008CBA',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: currentTemplate === 2 ? 'bold' : 'normal'
            }}
            onClick={() => loadTemplate(template2Data, 2)}
          >
            👕 Load Template 2
          </button>
        </div>

        {/* Status Indicator */}
        <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
          Currently Loaded: <strong>Template {currentTemplate}</strong>
        </div>
      </header>

      {/* Main Editor Area */}
      <main>
        {template ? (
          // Render the Beefree SDK editor with the current template
          // When template prop changes, the editor will reload with the new template
          <BeefreeEditor template={template} onSave={handleSave} />
        ) : (
          // Loading state (shown briefly during initial load)
          <p>Initializing Beefree SDK...</p>
        )}
      </main>
    </div>
  );
}

export default App;
