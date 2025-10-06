import { useEffect, useRef } from 'react';
import BeefreeSDK from '@beefree.io/sdk';

/**
 * BeefreeEditor Component Props Interface
 * Defines the contract for passing data to the Beefree editor component
 */
interface BeefreeEditorProps {
  /** 
   * The complete Beefree template JSON object
   * Must follow Beefree SDK template structure with page.body, page.rows, etc.
   */
  template: object;
  
  /**
   * Callback function invoked when user saves their work in the editor
   * Receives the complete updated template JSON from Beefree SDK
   */
  onSave: (jsonFile: object) => void;
}

/**
 * BeefreeEditor Component
 * 
 * This component manages the Beefree SDK editor lifecycle:
 * 1. Initial Setup: Authenticates and initializes the editor on first render
 * 2. Template Loading: Loads new templates when props.template changes
 * 3. Save Handling: Processes save events from the editor
 * 
 * Key Concepts:
 * - Uses React useRef to maintain a persistent reference to the Beefree SDK instance
 * - Uses useEffect to respond to template changes
 * - Follows Beefree SDK best practices for initialization and template loading
 */
export default function BeefreeEditor(props: BeefreeEditorProps) {
  /**
   * Ref to store the Beefree SDK instance
   * This persists across re-renders, allowing us to reuse the same editor instance
   * instead of recreating it each time (which would be inefficient)
   */
  const beeInstanceRef = useRef<any>(null);

  /**
   * Effect Hook - Manages Beefree SDK Initialization and Template Loading
   * 
   * This effect runs whenever props.template changes, implementing the following logic:
   * 
   * FIRST RUN (Editor doesn't exist):
   * 1. Authenticate with Beefree backend via proxy server
   * 2. Create new BeefreeSDK instance with auth token
   * 3. Call bee.start() to initialize the editor with the initial template
   * 4. Store the instance in beeInstanceRef for future use
   * 
   * SUBSEQUENT RUNS (Editor already exists):
   * 1. Call beeInstance.load() to load the new template
   * 2. This smoothly transitions the editor to show the new template content
   * 
   * Why this approach works:
   * - Initializing once with start() is more efficient than destroying/recreating
   * - Using load() for template changes provides smooth user experience
   * - Following Beefree SDK recommended patterns from official documentation
   */
  useEffect(() => {
    async function setupEditor() {
      // Guard clause: Exit early if no template is provided yet
      if (!props.template) {
        console.warn('No template provided to BeefreeEditor');
        return;
      }

      // SCENARIO 1: Editor already exists - just load the new template
      if (beeInstanceRef.current) {
        console.log('Loading new template into existing Beefree SDK instance...');
        
        /**
         * beeInstance.load(template)
         * 
         * This method replaces the current template in the editor with a new one.
         * - Triggers a loading dialog in the UI
         * - Preserves the editor state (undo history is reset)
         * - Allows users to switch between templates seamlessly
         * 
         * Alternative: beeInstance.reload(template) - same as load() but without loading dialog
         */
        beeInstanceRef.current.load(props.template);
        
      } else {
        // SCENARIO 2: First initialization - create the editor
        console.log('Initializing Beefree SDK for the first time...');
        
        try {
          /**
           * STEP 1: Authentication
           * Request an authentication token from your backend proxy server
           * This token grants permission to use the Beefree SDK for this session
           * 
           * Security Note: Never expose your Beefree credentials in frontend code!
           * Always use a backend proxy to obtain tokens securely.
           */
          const response = await fetch('http://localhost:3001/proxy/bee-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: 'demo-user' }) // Unique user identifier
          });

          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
          }

          const token = await response.json();
          console.log('Successfully obtained Beefree SDK authentication token');

          /**
           * STEP 2: Configure the Editor
           * Define the editor's behavior, callbacks, and container element
           */
          const beeConfig = {
            // ID of the DOM element where the editor will be rendered
            container: 'beefree-react-demo',
            
            // Editor language (affects UI labels, not template content)
            language: 'en-US',
            
            /**
             * onSave Callback
             * Triggered when user clicks the "Save" button in the editor
             * 
             * @param pageJson - The complete template JSON as a string
             * @param pageHtml - (optional) The rendered HTML version of the email
             * 
             * Flow:
             * 1. User clicks "Save" in Beefree editor
             * 2. Beefree SDK prepares the JSON and HTML
             * 3. This callback is invoked
             * 4. We parse JSON and pass it to parent component via props.onSave
             * 5. Parent component can save to database, show confirmation, etc.
             */
            onSave: (pageJson: string) => {
              console.log('Save triggered - Processing template JSON...');
              try {
                const templateObject = JSON.parse(pageJson);
                props.onSave(templateObject);
              } catch (error) {
                console.error('Failed to parse saved template JSON:', error);
              }
            },
            
            /**
             * onError Callback
             * Handles any errors that occur within the Beefree SDK
             * Common errors: Invalid template structure, network issues, etc.
             */
            onError: (error: unknown) => {
              console.error('Beefree SDK Error:', error);
              // In production, you might want to show user-friendly error messages
              // or send error logs to a monitoring service
            }
          };

          /**
           * STEP 3: Create Beefree SDK Instance
           * Initialize the SDK with the authentication token
           * This creates a new instance but doesn't render the editor yet
           */
          const bee = new BeefreeSDK(token);

          /**
           * STEP 4: Store Instance for Future Use
           * Save the instance to our ref so we can call methods on it later
           * (like load() when switching templates)
           */
          beeInstanceRef.current = bee;

          /**
           * STEP 5: Start the Editor
           * 
           * bee.start(config, template, options)
           * - Renders the editor UI in the specified container
           * - Loads the initial template
           * - Sets up all event listeners and callbacks
           * 
           * This is where the magic happens - the Beefree editor appears on screen!
           */
          console.log('Starting Beefree SDK editor with initial template...');
          await bee.start(beeConfig, props.template);
          console.log('Beefree SDK editor successfully initialized!');

        } catch (error) {
          console.error('Failed to initialize Beefree SDK:', error);
          // In production, show user-friendly error message or retry logic
        }
      }
    }

    setupEditor();

  }, [props.template, props.onSave]); // Dependencies: Re-run when template or onSave changes

  /**
   * Render the Container Div
   * This is where the Beefree SDK will inject the editor UI
   * The ID must match the 'container' value in beeConfig
   */
  return (
    <div
      id="beefree-react-demo"
      style={{
        height: '80vh',
        border: '1px solid #ddd',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '100%',
        backgroundColor: '#f9f9f9'
      }}
    />
  );
}
