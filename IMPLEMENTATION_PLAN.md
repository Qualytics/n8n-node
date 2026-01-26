# Qualytics n8n Node Implementation Plan

## Overview

Refactor the scaffold GitHub Issues node into a **Qualytics Trigger Node** that receives webhook events from Qualytics Flow Actions. This node will enable n8n users to trigger workflows when Qualytics detects data quality anomalies.

## Target: n8n Community Node Verification

This implementation must comply with [n8n verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/):

| Requirement | Status | Notes |
|-------------|--------|-------|
| Package name `n8n-nodes-*` | ✅ Ready | `n8n-nodes-qualytics` |
| MIT License | ✅ Ready | Already set |
| TypeScript | ✅ Ready | Project configured |
| `n8n-community-node-package` keyword | ✅ Ready | In package.json |
| No runtime dependencies | ✅ Ready | Only dev/peer deps |
| English documentation | 🔄 Needed | README rewrite |
| Pass `npx @n8n/scan-community-package` | 🔄 Needed | Run after implementation |

---

## Phase 1: Cleanup Scaffold Code

### Delete Files

```
credentials/GithubIssuesApi.credentials.ts
credentials/GithubIssuesOAuth2Api.credentials.ts
icons/github.svg
icons/github.dark.svg
nodes/GithubIssues/                    # Entire directory
```

---

## Phase 2: Create Qualytics Node

### 2.1 Create Icon

**File:** `icons/qualytics.svg`

Create or obtain the Qualytics brand icon in SVG format. Size should be 60x60px.

### 2.2 Create Credentials (Optional Auth)

**File:** `credentials/QualyticsApi.credentials.ts`

Optional authentication for webhook verification. Allows Qualytics to send a secret header that the node validates.

```typescript
import type {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class QualyticsApi implements ICredentialType {
  name = 'qualyticsApi';
  displayName = 'Qualytics API';
  documentationUrl = 'https://docs.qualytics.io/integrations/n8n';

  properties: INodeProperties[] = [
    {
      displayName: 'Webhook Secret',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Optional secret to validate incoming webhook requests from Qualytics',
    },
  ];
}
```

### 2.3 Create Trigger Node

**File:** `nodes/QualyticsTrigger/QualyticsTrigger.node.ts`

```typescript
import type {
  IWebhookFunctions,
  IWebhookResponseData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class QualyticsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Qualytics Trigger',
    name: 'qualyticsTrigger',
    icon: 'file:../../icons/qualytics.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"] || "all events"}}',
    description: 'Triggers workflow when a Qualytics Flow Action fires',
    defaults: {
      name: 'Qualytics Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'qualyticsApi',
        required: false,
        displayOptions: {
          show: {
            authentication: ['webhookSecret'],
          },
        },
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'qualytics',
      },
    ],
    properties: [
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Webhook Secret',
            value: 'webhookSecret',
          },
        ],
        default: 'none',
        description: 'How to authenticate incoming webhook requests',
      },
      {
        displayName: 'Event Filter',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'All Events',
            value: 'all',
          },
          {
            name: 'Flow Triggered',
            value: 'qualytics.flow.triggered',
          },
        ],
        default: 'all',
        description: 'Which events to trigger on',
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = this.getBodyData() as IQualyticsWebhookPayload;

    // Optional: Validate webhook secret
    const authentication = this.getNodeParameter('authentication') as string;
    if (authentication === 'webhookSecret') {
      const credentials = await this.getCredentials('qualyticsApi');
      const expectedSecret = credentials.webhookSecret as string;
      const receivedSecret = req.headers['x-qualytics-secret'] as string;

      if (expectedSecret && receivedSecret !== expectedSecret) {
        return {
          webhookResponse: { status: 401, body: 'Unauthorized' },
        };
      }
    }

    // Optional: Filter by event type
    const eventFilter = this.getNodeParameter('event') as string;
    if (eventFilter !== 'all' && body.event !== eventFilter) {
      return {
        webhookResponse: { status: 200, body: 'Event filtered' },
      };
    }

    // Return the payload data to the workflow
    return {
      workflowData: [
        this.helpers.returnJsonArray(body),
      ],
    };
  }
}

// Type definition for the Qualytics webhook payload
interface IQualyticsWebhookPayload {
  event: string;
  flow: {
    id: number;
    name: string;
  };
  datastore: {
    id: number;
    name: string;
  };
  trigger: {
    type: string;
    timestamp: string;
  };
  context: {
    anomalies: Array<{
      id: number;
      type: string;
      description: string;
      container: string;
      field: string;
      created_at: string;
    }>;
    containers: Array<{
      id: number;
      name: string;
    }>;
    quality_checks: Array<{
      id: number;
      name: string;
      status: string;
    }>;
  };
}
```

### 2.4 Create Node Metadata

**File:** `nodes/QualyticsTrigger/QualyticsTrigger.node.json`

```json
{
  "node": "n8n-nodes-qualytics.qualyticsTrigger",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["Data & Storage"],
  "resources": {
    "primaryDocumentation": [
      {
        "url": "https://docs.qualytics.io/integrations/n8n"
      }
    ]
  }
}
```

---

## Phase 3: Update Configuration

### 3.1 Update package.json

```json
{
  "name": "n8n-nodes-qualytics",
  "version": "0.1.0",
  "description": "n8n community node for Qualytics data quality platform integration",
  "license": "MIT",
  "homepage": "https://github.com/Qualytics/n8n-nodes-qualytics",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Qualytics/n8n-nodes-qualytics.git"
  },
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "qualytics",
    "data-quality",
    "workflow-automation"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "strict": true,
    "credentials": [
      "dist/credentials/QualyticsApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/QualyticsTrigger/QualyticsTrigger.node.js"
    ]
  }
}
```

---

## Phase 4: Update Documentation

### 4.1 Rewrite README.md

```markdown
# n8n-nodes-qualytics

This is an n8n community node for [Qualytics](https://www.qualytics.io/), a data quality platform. It lets you trigger n8n workflows when Qualytics Flow Actions fire.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Qualytics Trigger

A webhook trigger node that starts your workflow when Qualytics sends a Flow Action event.

**Trigger Events:**
- Flow triggered (anomaly detection, quality checks, etc.)

**Available Data:**
- Flow ID and name
- Datastore ID and name
- Trigger type and timestamp
- Anomaly details (ID, type, description, affected fields)
- Container information
- Quality check results

## Setup

### In Qualytics

1. Navigate to Settings > Integrations
2. Add a new n8n integration
3. Enter the webhook URL from your n8n Qualytics Trigger node
4. (Optional) Set a webhook secret for authentication
5. Save the integration

### In n8n

1. Add a "Qualytics Trigger" node to your workflow
2. Copy the webhook URL shown in the node
3. (Optional) Configure webhook secret authentication
4. (Optional) Filter to specific event types
5. Activate your workflow

### In Your Qualytics Flow

1. Edit your Flow
2. Add a new Action
3. Select "Notification" action type
4. Choose your n8n integration
5. Save the Flow

## Credentials

### Webhook Secret (Optional)

For additional security, you can configure a shared secret:

1. In n8n, set Authentication to "Webhook Secret"
2. Enter a secret value in the credentials
3. Configure the same secret in your Qualytics n8n integration
4. Qualytics will send the secret in the `X-Qualytics-Secret` header

## Compatibility

- n8n version 1.60.0 or later
- Qualytics version X.X or later

## Example Workflow

```
[Qualytics Trigger] → [IF anomaly count > 10] → [Slack] Send alert
                                              → [Email] Send report
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes)
- [Qualytics documentation](https://docs.qualytics.io/)
- [Qualytics n8n integration guide](https://docs.qualytics.io/integrations/n8n)
```

---

## Phase 5: Validation

### 5.1 Build and Lint

```bash
npm run build
npm run lint
```

### 5.2 Run n8n Community Package Scanner

```bash
npx @n8n/scan-community-package
```

### 5.3 Test Locally

```bash
# Link the package for local testing
npm link

# In n8n installation directory
npm link n8n-nodes-qualytics

# Start n8n and verify the node appears
n8n start
```

### 5.4 Test Webhook

```bash
# Send test payload to webhook URL
curl -X POST http://localhost:5678/webhook/qualytics \
  -H "Content-Type: application/json" \
  -d '{
    "event": "qualytics.flow.triggered",
    "flow": {"id": 123, "name": "Test Flow"},
    "datastore": {"id": 456, "name": "Test DB"},
    "trigger": {"type": "anomaly_detected", "timestamp": "2026-01-25T12:00:00Z"},
    "context": {
      "anomalies": [],
      "containers": [],
      "quality_checks": []
    }
  }'
```

---

## Payload Contract with Controlplane

The n8n node expects the following JSON payload from Qualytics Flow Actions:

```typescript
interface QualyticsWebhookPayload {
  event: "qualytics.flow.triggered";
  flow: {
    id: number;
    name: string;
  };
  datastore: {
    id: number;
    name: string;
  };
  trigger: {
    type: string;  // e.g., "anomaly_detected", "quality_check_failed"
    timestamp: string;  // ISO 8601
  };
  context: {
    anomalies: Array<{
      id: number;
      type: string;
      description: string;
      container: string;
      field: string;
      created_at: string;
    }>;
    containers: Array<{
      id: number;
      name: string;
    }>;
    quality_checks: Array<{
      id: number;
      name: string;
      status: string;
    }>;
  };
}
```

**Headers:**
- `Content-Type: application/json`
- `X-Qualytics-Secret: <secret>` (if authentication configured)

---

## Checklist

- [ ] Delete scaffold GitHub Issues files
- [ ] Create `icons/qualytics.svg`
- [ ] Create `credentials/QualyticsApi.credentials.ts`
- [ ] Create `nodes/QualyticsTrigger/QualyticsTrigger.node.ts`
- [ ] Create `nodes/QualyticsTrigger/QualyticsTrigger.node.json`
- [ ] Update `package.json` with new paths and metadata
- [ ] Rewrite `README.md` with Qualytics documentation
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` with no errors
- [ ] Pass `npx @n8n/scan-community-package`
- [ ] Test webhook locally
- [ ] Coordinate payload contract with controlplane team
