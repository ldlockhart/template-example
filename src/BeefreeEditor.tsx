import { useEffect, useRef, useState } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

// Define the types for the props our component will accept
interface BeefreeEditorProps {
  template: object; // The full JSON object of the template
  onSave: (jsonFile: object) => void;
}

export default function BeefreeEditor(props: BeefreeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use state to hold the beeInstance once it's created
  const [beeInstance, setBeeInstance] = useState<any>(null);

  // This useEffect runs only ONCE on initial mount to create the editor
  useEffect(() => {
    async function initializeEditor() {
      // Get a token from your backend
      const response = await fetch('http://localhost:3001/proxy/bee-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 'demo-user' })
      });
      const token = await response.json();

      const bee = new BeefreeSDK(token);

      // The beeConfig now uses the onSave prop passed down from the parent
      const beeConfig = {
        container: 'beefree-react-demo',
        language: 'en-US',
        onSave: (pageJson: string) => {
          // When the editor saves, call the parent's onSave function
          props.onSave(JSON.parse(pageJson));
        },
        onError: (error: unknown) => {
          console.error('Error:', error);
        }
      };

      // Use `create` to get the instance, then `start`
      bee.create(beeConfig, (instance) => {
        // Save the instance to our state so we can use it later
        setBeeInstance(instance);

        // Start the editor with the initial template from props
        instance.start(props.template);
      });
    }

    initializeEditor();
  }, []); // The empty dependency array ensures this runs only once

  // This NEW useEffect hook runs whenever the `template` prop changes
  useEffect(() => {
    // If the instance exists and a new template has been passed down, load it
    if (beeInstance && props.template) {
      beeInstance.load(props.template);
    }
  }, [props.template]); // The dependency array ensures this runs whenever props.template changes!


  return (
    <div
      id="beefree-react-demo"
      ref={containerRef}
      style={{
        height: '80vh', // Adjusted for better viewing
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    />
  );
}
