# N8N Automation Workflow for Proposal Generation

## Overview
This guide explains how to set up an n8n automation that generates Word document proposals from your HTML template.

## Workflow Architecture

```
[Trigger] → [Get Data] → [Process Template] → [Convert to DOCX] → [Save to OneDrive/SharePoint]
```

## Required n8n Nodes

### 1. **Trigger Node** (Choose one)
- **Webhook**: Triggered when form is submitted from UI
- **Database Trigger**: MySQL/PostgreSQL trigger when new project is added
- **Manual Trigger**: For testing or manual generation

### 2. **Get Project Data** (Multiple sources)
- **MySQL Node**: Fetch client and project data from database
- **HTTP Request Node**: Get data from your API
- **Set Node**: Combine data from multiple sources

### 3. **Function Node**: Process and replace template placeholders

### 4. **HTML to DOCX Conversion** (Choose one approach)

#### Option A: Using Pandoc via Execute Command Node
```bash
pandoc input.html -o output.docx
```

#### Option B: Using HTML-DOCX-JS Library via Code Node
```javascript
const HTMLtoDOCX = require('html-docx-js');
```

#### Option C: Using External API (Recommended)
- **Docmosis** (paid)
- **Cloudmersive** (has free tier)
- **Aspose** (paid)

### 5. **File Storage Node** (Choose one)
- **Microsoft OneDrive Node**
- **Microsoft SharePoint Node**
- **Google Drive Node**
- **Local File System** (for on-premise)

---

## Detailed Step-by-Step Setup

### Step 1: Create Webhook Trigger

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "create-proposal",
        "responseMode": "responseNode",
        "httpMethod": "POST"
      }
    }
  ]
}
```

**Expected Webhook Payload:**
```json
{
  "projectId": "12345",
  "clientId": "CLIENT001",
  "offerNumber": "2025-001",
  "customData": {
    "items": [
      {
        "quantity": 3,
        "type": "3D-Außenvisualisierung",
        "price": 899
      }
    ]
  }
}
```

---

### Step 2: Fetch Data from Database

```javascript
// MySQL Query Node
SELECT 
  c.company_name,
  c.street,
  c.postal_code,
  c.city,
  c.country,
  c.contact_person,
  c.email,
  p.project_name,
  p.project_number,
  p.created_at
FROM clients c
INNER JOIN projects p ON c.client_id = p.client_id
WHERE p.project_id = {{ $json["projectId"] }}
```

---

### Step 3: Process Template with Function Node

```javascript
// Function Node: Replace Template Placeholders
const html = `<!DOCTYPE html>
<html>
... your template HTML ...
</html>`;

// Get data from previous nodes
const clientData = $input.first().json;
const projectData = $('Webhook').first().json;

// Generate offer number if not provided
const offerNumber = projectData.offerNumber || 
  `${new Date().getFullYear()}-${String(projectData.projectId).padStart(4, '0')}`;

// Format date
const today = new Date().toLocaleDateString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Calculate totals
let nettoTotal = 0;
projectData.customData.items.forEach(item => {
  nettoTotal += item.quantity * item.price;
});
const mwst = (nettoTotal * 0.19).toFixed(2);
const bruttoTotal = (nettoTotal + parseFloat(mwst)).toFixed(2);

// Replace all placeholders
let processedHtml = html
  .replace(/\{\{companyName\}\}/g, clientData.company_name)
  .replace(/\{\{street\}\}/g, clientData.street)
  .replace(/\{\{postalCode\}\}/g, clientData.postal_code)
  .replace(/\{\{city\}\}/g, clientData.city)
  .replace(/\{\{country\}\}/g, clientData.country)
  .replace(/\{\{offerNumber\}\}/g, offerNumber)
  .replace(/\{\{date\}\}/g, today)
  .replace(/\{\{nettoTotal\}\}/g, nettoTotal.toFixed(2))
  .replace(/\{\{mwst\}\}/g, mwst)
  .replace(/\{\{bruttoTotal\}\}/g, bruttoTotal);

// Return processed HTML
return [{
  json: {
    html: processedHtml,
    filename: `Angebot_${offerNumber}_${clientData.company_name.replace(/\s/g, '_')}.docx`,
    clientData: clientData,
    projectData: projectData,
    calculations: {
      netto: nettoTotal,
      mwst: mwst,
      brutto: bruttoTotal
    }
  }
}];
```

---

### Step 4: Convert HTML to DOCX

#### Option A: Using Cloudmersive API (Recommended)

1. **Sign up for Cloudmersive**: https://cloudmersive.com (Free tier: 800 calls/month)
2. **Get API Key**
3. **Add HTTP Request Node:**

```json
{
  "name": "Convert to DOCX",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.cloudmersive.com/convert/html/to/docx",
    "authentication": "headerAuth",
    "headerAuth": {
      "name": "Apikey",
      "value": "YOUR_API_KEY"
    },
    "bodyParametersUi": {
      "parameter": [
        {
          "name": "inputFileUrl",
          "value": "={{ $json.html }}"
        }
      ]
    },
    "options": {
      "response": {
        "response": {
          "responseFormat": "file"
        }
      }
    }
  }
}
```

#### Option B: Using Code Node with mammoth.js

```javascript
// Install in n8n: npm install html-docx-js-typescript

const items = $input.all();
const htmlContent = items[0].json.html;

// Simple conversion (may lose some formatting)
const asBlob = require('html-docx-js/dist/html-docx');

const docx = asBlob(htmlContent, {
  orientation: 'portrait',
  margins: { top: 720, right: 720, bottom: 720, left: 720 } // 0.5 inch
});

return [{
  json: {
    ...items[0].json
  },
  binary: {
    data: {
      data: docx.toString('base64'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileName: items[0].json.filename,
      fileExtension: 'docx'
    }
  }
}];
```

#### Option C: Using Pandoc (Requires Docker or System Installation)

```javascript
// Execute Command Node
{
  "command": "pandoc",
  "arguments": [
    "-f", "html",
    "-t", "docx",
    "-o", "/tmp/{{ $json.filename }}",
    "--reference-doc=/path/to/template.docx" // Optional: for styling
  ],
  "stdin": "={{ $json.html }}"
}
```

---

### Step 5: Save to OneDrive/SharePoint

#### OneDrive Node Configuration:

```json
{
  "name": "Save to OneDrive",
  "type": "n8n-nodes-base.microsoftOneDrive",
  "parameters": {
    "operation": "upload",
    "path": "/Proposals/2025/{{ $json.filename }}",
    "binaryPropertyName": "data",
    "options": {}
  },
  "credentials": {
    "microsoftOneDriveOAuth2Api": "OneDrive Credentials"
  }
}
```

---

## Complete N8N Workflow JSON

Save this as `proposal-generator-workflow.json` and import into n8n:

```json
{
  "name": "Proposal Generator",
  "nodes": [
    {
      "parameters": {
        "path": "create-proposal",
        "responseMode": "lastNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300],
      "webhookId": "create-proposal",
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM clients WHERE client_id = {{ $json.clientId }}"
      },
      "name": "Get Client Data",
      "type": "n8n-nodes-base.mysql",
      "position": [460, 300],
      "typeVersion": 1,
      "credentials": {
        "mysql": "MySQL Database"
      }
    },
    {
      "parameters": {
        "functionCode": "// See Function Node code above"
      },
      "name": "Process Template",
      "type": "n8n-nodes-base.function",
      "position": [680, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.cloudmersive.com/convert/html/to/docx"
      },
      "name": "Convert to DOCX",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "operation": "upload",
        "path": "=/Proposals/{{ $json.filename }}"
      },
      "name": "Save to OneDrive",
      "type": "n8n-nodes-base.microsoftOneDrive",
      "position": [1120, 300],
      "typeVersion": 1
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Get Client Data", "type": "main", "index": 0}]]
    },
    "Get Client Data": {
      "main": [[{"node": "Process Template", "type": "main", "index": 0}]]
    },
    "Process Template": {
      "main": [[{"node": "Convert to DOCX", "type": "main", "index": 0}]]
    },
    "Convert to DOCX": {
      "main": [[{"node": "Save to OneDrive", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Setup Instructions

### 1. Install n8n (if not already installed)

```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Using npm
npm install n8n -g
n8n start
```

### 2. Configure Database Connection
- Go to **Credentials** → **New** → **MySQL** (or PostgreSQL)
- Enter your database details

### 3. Configure OneDrive/SharePoint
- Go to **Credentials** → **New** → **Microsoft OneDrive OAuth2 API**
- Follow OAuth flow to authenticate

### 4. Configure Cloudmersive API (for DOCX conversion)
- Sign up at https://cloudmersive.com
- Get API key from dashboard
- Add as **Header Auth** credential in n8n

### 5. Import Workflow
- Copy the workflow JSON
- Go to n8n → **Workflows** → **Import from File/URL**
- Paste JSON or upload file

### 6. Test Workflow
- Open workflow
- Click **Execute Workflow**
- Or send POST request to webhook URL:

```bash
curl -X POST http://localhost:5678/webhook/create-proposal \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "12345",
    "clientId": "CLIENT001",
    "offerNumber": "2025-001"
  }'
```

---

## Integration with Your UI

### React/Vue Frontend Example:

```javascript
async function generateProposal(formData) {
  const response = await fetch('http://your-n8n-instance:5678/webhook/create-proposal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: formData.projectId,
      clientId: formData.clientId,
      customData: {
        items: formData.items,
        deliveryTime: formData.deliveryTime
      }
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Proposal generated successfully!');
    // Optional: Download link
    window.open(result.fileUrl, '_blank');
  }
}
```

---

## Advanced Features

### 1. Email Notification After Generation

Add **Send Email** node after OneDrive:

```json
{
  "parameters": {
    "fromEmail": "proposals@exposeprofi.de",
    "toEmail": "={{ $('Get Client Data').first().json.email }}",
    "subject": "Ihr Angebot {{ $json.offerNumber }}",
    "text": "Sehr geehrte Damen und Herren,\n\nanbei finden Sie Ihr persönliches Angebot.",
    "attachments": "data"
  },
  "name": "Send Email",
  "type": "n8n-nodes-base.emailSend"
}
```

### 2. Store Metadata in Database

Add **MySQL Insert** node:

```sql
INSERT INTO proposals (
  project_id,
  offer_number,
  file_path,
  total_amount,
  created_at,
  status
) VALUES (
  {{ $json.projectId }},
  '{{ $json.offerNumber }}',
  '{{ $json.fileUrl }}',
  {{ $json.calculations.brutto }},
  NOW(),
  'draft'
)
```

### 3. Version Control

```javascript
// Check if proposal already exists
const existingFiles = await oneDrive.list('/Proposals/2025/');
let filename = $json.filename;
let version = 1;

while (existingFiles.includes(filename)) {
  version++;
  filename = filename.replace('.docx', `_v${version}.docx`);
}

return [{ json: { ...json, filename } }];
```

---

## Troubleshooting

### Issue: HTML to DOCX conversion loses formatting
**Solution**: Use a reference DOCX template with Pandoc or use Cloudmersive Premium

### Issue: OneDrive authentication fails
**Solution**: Ensure redirect URL is whitelisted in Azure AD app registration

### Issue: Large files timeout
**Solution**: Increase n8n timeout in settings:
```bash
N8N_PAYLOAD_SIZE_MAX=50
N8N_TIMEOUT=300000
```

---

## Cost Estimation

- **n8n**: Self-hosted (free) or Cloud ($20-50/month)
- **Cloudmersive**: Free tier (800 calls/month) or $9/month
- **OneDrive**: Included with Microsoft 365
- **Database**: Existing infrastructure

**Total**: $0-60/month depending on volume

---

## Next Steps

1. ✅ Set up n8n instance
2. ✅ Configure database connection
3. ✅ Set up OneDrive authentication
4. ✅ Import workflow
5. ✅ Test with sample data
6. ✅ Integrate with your UI
7. ✅ Train team on manual trigger option
8. ✅ Monitor and optimize

