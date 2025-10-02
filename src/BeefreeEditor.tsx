import { useEffect, useRef, useState } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

interface BeefreeEditorProps {
  template: object; // The full JSON object of the template
  onSave: (jsonFile: object) => void;
}

export default function BeefreeEditor(props: BeefreeEditorProps) {
  const beeInstanceRef = useRef<any>(null);

  useEffect(() => {
    async function setupEditor() {
      // If no template is passed yet, do nothing.
      if (!props.template) {
        return;
      }

      // Check if the editor has already been created
      if (beeInstanceRef.current) {
        // If it exists, just load the new template
        beeInstanceRef.current.load(props.template);
      } else {
        // If it doesn't exist, this is the first run. Let's create it.
        const response = await fetch('http://localhost:3001/proxy/bee-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: 'demo-user' })
        });
        const token = await response.json();

        const beeConfig = {
          container: 'beefree-react-demo',
          language: 'en-US',
          onSave: (pageJson: string) => {
            props.onSave(JSON.parse(pageJson));
          },
          onError: (error: unknown) => {
            console.error('Beefree Error:', error);
          }
        };

        // Initialize the instance with `new`
        const bee = new BeefreeSDK(token);

        // Save the instance to our ref for future use
        beeInstanceRef.current = bee;

        // Start the editor with the initial template
        bee.start(beeConfig, props.template);
      }
    }

    setupEditor();

  }, [props.template]); // Dependency: This hook runs whenever props.template changes!


  return (
    // The container div for the editor
    <div
      id="beefree-react-demo"
      style={{
        height: '80vh',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    />
  );
}
