# Loading Templates in Beefree SDK - Complete Recipe

## 🎯 Overview

This guide explains how to load and switch between templates in the Beefree SDK editor, following official best practices and patterns used in production applications.

## 📋 Table of Contents

1. [Understanding Template Structure](#understanding-template-structure)
2. [Initial Setup & Authentication](#initial-setup--authentication)
3. [Loading Templates: Two Scenarios](#loading-templates-two-scenarios)
4. [Template JSON Requirements](#template-json-requirements)
5. [Code Examples](#code-examples)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Understanding Template Structure

### Valid Beefree SDK Template

A valid Beefree template must include:

```json
{
  "page": {
    "body": {
      "container": {
        "style": {
          "background-color": "#ffffff"
        }
      },
      "content": {
        "computedStyle": {
          "linkColor": "#0068A5",
          "messageBackgroundColor": "transparent",
          "messageWidth": "600px"
        },
        "style": {
          "color": "#000000",
          "font-family": "Arial, Helvetica Neue, Helvetica, sans-serif"
        }
      },
      "webFonts": []
    },
    "description": "My Email Template",
    "rows": [
      // ... row content
    ],
    "template": {
      "version": "2.0.0"
    }
  }
}
```

### Invalid Template (Common Mistake)

```json
{
  "page": {
    "rows": [
      // ... rows only, missing body, template version, etc.
    ]
  }
}
```

**❌ This will fail!** The Beefree SDK requires the complete structure including body styles and template version.

---

## 🔐 Initial Setup & Authentication

### Step 1: Set Up Backend Proxy

**Why?** Never expose Beefree credentials in frontend code. Always use a backend proxy.

```javascript
// backend/proxy-server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy/bee-auth', async (req, res) => {
  try {
    const response = await fetch('https://auth.getbee.io/apiauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.BEE_CLIENT_ID,
        client_secret: process.env.BEE_CLIENT_SECRET,
        grant_type: 'password',
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.listen(3001);
```

### Step 2: Create Environment Variables

```bash
# .env
BEE_CLIENT_ID=your_client_id_here
BEE_CLIENT_SECRET=your_client_secret_here
```

---

## 🔄 Loading Templates: Two Scenarios

### Scenario 1: Initial Initialization (First Load)

**When:** Component mounts for the first time  
**Method:** `bee.start(config, template)`

```typescript
// First time setup
const token = await getAuthToken();
const bee = new BeefreeSDK(token);

const beeConfig = {
  container: 'bee-editor-container',
  language: 'en-US',
  onSave: (jsonFile) => {
    console.log('Saved:', jsonFile);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
};

// Start with initial template
await bee.start(beeConfig, initialTemplate);
```

**What happens:**
1. Creates the editor UI in the specified container
2. Loads the template
3. Sets up all event listeners
4. Returns a promise that resolves when ready

---

### Scenario 2: Switching Templates (Subsequent Loads)

**When:** User wants to load a different template  
**Method:** `beeInstance.load(newTemplate)`

```typescript
// Reuse the existing instance
beeInstance.load(newTemplate);
```

**What happens:**
1. Shows a loading dialog
2. Clears the current template
3. Loads the new template
4. Resets undo/redo history

**Alternative:** `beeInstance.reload(template)` - Same as `load()` but without the loading dialog (smoother for real-time updates).

---

## 📦 Template JSON Requirements

### Required Fields

```typescript
interface BeefreeTemplate {
  page: {
    body: {
      container: {
        style: Record<string, string>
      },
      content: {
        computedStyle: {
          linkColor: string,
          messageBackgroundColor: string,
          messageWidth: string
        },
        style: Record<string, string>
      },
      webFonts: Array<WebFont>
    },
    description?: string,
    rows: Array<Row>,
    template: {
      version: string  // e.g., "2.0.0"
    }
  }
}
```

### Module Types

Common content modules you can use:

- `mailup-bee-newsletter-modules-text` - Text content
- `mailup-bee-newsletter-modules-heading` - Headings (h1-h6)
- `mailup-bee-newsletter-modules-paragraph` - Paragraphs
- `mailup-bee-newsletter-modules-image` - Images
- `mailup-bee-newsletter-modules-button` - CTA buttons
- `mailup-bee-newsletter-modules-divider` - Horizontal dividers
- `mailup-bee-newsletter-modules-social` - Social media icons
- `mailup-bee-newsletter-modules-spacer` - Vertical spacing

---

## 💻 Code Examples

### React Component with Template Switching

```typescript
import { useState, useEffect, useRef } from 'react';
import BeefreeSDK from '@beefree.io/sdk';
import template1 from './templates/template1.json';
import template2 from './templates/template2.json';

function BeefreeEditor() {
  const [currentTemplate, setCurrentTemplate] = useState(1);
  const beeInstanceRef = useRef<any>(null);

  useEffect(() => {
    async function initEditor() {
      // Get auth token from backend
      const response = await fetch('http://localhost:3001/proxy/bee-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 'user-123' })
      });
      const token = await response.json();

      // Create SDK instance
      const bee = new BeefreeSDK(token);
      beeInstanceRef.current = bee;

      // Start with template 1
      await bee.start({
        container: 'bee-editor',
        language: 'en-US',
        onSave: (json) => console.log('Saved:', json)
      }, template1);
    }

    initEditor();
  }, []);

  const switchTemplate = (templateNumber: number) => {
    if (!beeInstanceRef.current) return;

    const newTemplate = templateNumber === 1 ? template1 : template2;
    beeInstanceRef.current.load(newTemplate);
    setCurrentTemplate(templateNumber);
  };

  return (
    <div>
      <div>
        <button onClick={() => switchTemplate(1)}>
          Load Template 1
        </button>
        <button onClick={() => switchTemplate(2)}>
          Load Template 2
        </button>
      </div>
      <div id="bee-editor" style={{ height: '600px' }} />
    </div>
  );
}
```

---

## 🎨 Common Patterns

### Pattern 1: Load from API

```typescript
async function loadTemplateFromAPI(templateId: string) {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    const template = await response.json();
    
    if (beeInstance) {
      beeInstance.load(template);
    }
  } catch (error) {
    console.error('Failed to load template:', error);
  }
}
```

### Pattern 2: Save and Load User's Work

```typescript
const beeConfig = {
  container: 'bee-editor',
  language: 'en-US',
  
  // Save to backend
  onSave: async (jsonFile, htmlFile) => {
    await fetch('/api/templates/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: JSON.parse(jsonFile),
        html: htmlFile,
        updatedAt: new Date().toISOString()
      })
    });
  },
  
  // Auto-save to local storage
  onAutoSave: (jsonFile) => {
    localStorage.setItem('template-autosave', jsonFile);
  }
};

// Restore from auto-save
const autosaved = localStorage.getItem('template-autosave');
if (autosaved) {
  beeInstance.load(JSON.parse(autosaved));
}
```

### Pattern 3: Template with Pre-populated Data

```typescript
// Fetch template and user data
const [template, userData] = await Promise.all([
  fetch('/api/templates/welcome-email').then(r => r.json()),
  fetch('/api/users/current').then(r => r.json())
]);

// Customize template with user data
const customizedTemplate = {
  ...template,
  page: {
    ...template.page,
    rows: template.page.rows.map(row => {
      // Replace placeholders with actual data
      return replaceVariables(row, userData);
    })
  }
};

beeInstance.load(customizedTemplate);
```

---

## 🐛 Troubleshooting

### Issue: "Template failed to load"

**Causes:**
- Missing required fields (body, template.version)
- Invalid JSON structure
- Malformed module descriptors

**Solution:**
```typescript
// Validate template before loading
function validateTemplate(template: any): boolean {
  return !!(
    template?.page?.body &&
    template?.page?.rows &&
    template?.page?.template?.version
  );
}

if (validateTemplate(newTemplate)) {
  beeInstance.load(newTemplate);
} else {
  console.error('Invalid template structure');
}
```

### Issue: Editor not appearing

**Causes:**
- Container element doesn't exist
- Container has no height
- Authentication failed

**Solution:**
```typescript
// Ensure container exists and has dimensions
const container = document.getElementById('bee-editor');
if (!container) {
  console.error('Container not found');
  return;
}

// Set minimum height
container.style.minHeight = '600px';
```

### Issue: Template loads but appears broken

**Causes:**
- Missing web fonts
- Invalid image URLs
- Incorrect module types

**Solution:**
```typescript
// Check template has valid structure
const template = {
  page: {
    body: {
      // ... ensure all required body fields
      webFonts: [
        {
          name: 'Roboto',
          fontFamily: 'Roboto',
          url: 'https://fonts.googleapis.com/css?family=Roboto'
        }
      ]
    },
    rows: [/* ... */]
  }
};
```

---

## 🎓 Best Practices

1. **Initialize Once, Load Many Times**
   - Use `bee.start()` once when component mounts
   - Use `beeInstance.load()` for all subsequent template changes

2. **Keep Instance Reference**
   - Store the Beefree instance in a ref (React) or class property
   - Never create multiple instances for the same container

3. **Validate Templates**
   - Always validate template structure before loading
   - Provide fallback templates for errors

4. **Handle Loading States**
   - Show loading indicators during template switches
   - Disable UI controls during loading

5. **Save User Work**
   - Implement auto-save with `onAutoSave` callback
   - Store drafts in localStorage or backend

6. **Error Handling**
   - Always implement `onError` callback
   - Log errors for debugging
   - Show user-friendly error messages

---

## 📚 Additional Resources

- [Beefree SDK Official Documentation](https://docs.beefree.io/beefree-sdk)
- [Beefree SDK React Guide](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/react)
- [Methods and Events Reference](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/methods-and-events)
- [Template JSON Structure](https://docs.beefree.io/beefree-sdk/resources/cookbook)

---

## 🤝 Contributing

Found an issue or have improvements? Please submit a PR or open an issue.

---

**Last Updated:** October 2025  
**Beefree SDK Version:** Latest  
**Author:** Beefree SDK Implementation Team

