# Qualytics n8n Node Specification

## Overview

This document specifies the implementation plan for refactoring the n8n-nodes-qualytics package from the GitHub Issues example scaffold into a Qualytics integration node. The node will enable n8n workflows to receive context from Qualytics Flow Actions, allowing users to trigger automations based on Qualytics data quality events.

## Target: Community Verification

This node will be submitted for n8n community verification. All implementation must adhere to the [n8n Community Node Verification Guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/).

### Verification Requirements Checklist

- [ ] Package name follows convention: `n8n-nodes-qualytics`
- [ ] MIT License
- [ ] No runtime dependencies (dev dependencies only)
- [ ] TypeScript with strict mode
- [ ] Linter passes (`npx @n8n/scan-community-package`)
- [ ] All UI and documentation in English
- [ ] `n8n-community-node-package` in package keywords
- [ ] Nodes and credentials registered in `package.json` n8n attribute
- [ ] Public GitHub repository
- [ ] Comprehensive README with usage examples
- [ ] npm package author matches repository owner

## Node Architecture

### Node Type: Trigger Node

The Qualytics node will be a **Trigger Node** that receives webhook callbacks from Qualytics Flow Actions. This is the appropriate pattern because:

1. Qualytics initiates the communication (push model)
2. n8n workflows should activate when Qualytics events occur
3. Similar to existing notification integrations (Slack, Email, etc.)

### Node Name and Display

- **Internal Name:** `QualyticsTrigger`
- **Display Name:** `Qualytics Trigger`
- **Description:** `Receive events from Qualytics Flow Actions`
- **Icon:** Qualytics logo (SVG, light and dark variants)
- **Group:** `trigger`
- **Version:** 1

## Credential Specification

### Qualytics API Credentials

**Type:** `qualyticsApi`

**Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `baseUrl` | string | Yes | Qualytics instance URL (e.g., `https://your-instance.qualytics.io`) |
| `apiToken` | password | Yes | API token for authentication |

**Authentication:**
- Header-based: `Authorization: Bearer {{apiToken}}`
- Test endpoint: Health check or user info endpoint (TBD based on controlplane API)

## Trigger Node Specification

### Webhook Configuration

The trigger node will expose a webhook endpoint that Qualytics Flow Actions can call.

**Webhook Path:** `/qualytics-trigger`
**Method:** `POST`
**Content-Type:** `application/json`

### Incoming Payload Structure

The webhook will receive context from Qualytics Flow Actions. Expected payload structure (to be finalized with controlplane):

```typescript
interface QualyticsFlowActionPayload {
  // Event identification
  eventId: string;
  eventType: 'anomaly_detected' | 'quality_check_failed' | 'quality_check_passed' | 'flow_completed';
  timestamp: string; // ISO 8601

  // Source information
  source: {
    flowId: string;
    flowName: string;
    datastoreId: string;
    datastoreName: string;
    containerId?: string;
    containerName?: string;
  };

  // Quality check details (when applicable)
  qualityCheck?: {
    checkId: string;
    checkName: string;
    checkType: string;
    status: 'passed' | 'failed' | 'warning';
    recordsScanned?: number;
    anomaliesFound?: number;
    score?: number;
  };

  // Anomaly details (when applicable)
  anomalies?: Array<{
    anomalyId: string;
    fieldName: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    sampleValues?: string[];
  }>;

  // Additional context
  metadata?: Record<string, unknown>;
}
```

### Node Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `authentication` | options | Yes | Select credential type |

**Note:** Initial version keeps properties minimal. Future versions may add:
- Event type filtering
- Datastore filtering
- Severity threshold filtering

### Output

The trigger outputs the full payload as a single item, making all fields available for subsequent n8n nodes:

```typescript
{
  json: QualyticsFlowActionPayload,
  binary: {} // No binary data in v1
}
```

## File Structure

```
n8n-nodes-qualytics/
├── credentials/
│   └── QualyticsApi.credentials.ts      # API credentials
├── icons/
│   ├── qualytics.svg                    # Light mode icon
│   └── qualytics.dark.svg               # Dark mode icon (optional)
├── nodes/
│   └── Qualytics/
│       ├── QualyticsTrigger.node.ts     # Main trigger node
│       ├── QualyticsTrigger.node.json   # Node metadata (codex)
│       └── types.ts                     # TypeScript interfaces
├── package.json                         # Updated for Qualytics
├── tsconfig.json                        # (unchanged)
├── README.md                            # Updated documentation
├── LICENSE                              # MIT License
└── CHANGELOG.md                         # Version history
```

## Implementation Tasks

### Phase 1: Cleanup and Rename

1. Remove GitHub Issues example code:
   - Delete `credentials/GithubIssuesApi.credentials.ts`
   - Delete `credentials/GithubIssuesOAuth2Api.credentials.ts`
   - Delete `nodes/GithubIssues/` directory
   - Delete `icons/github.svg` and `icons/github.dark.svg`

2. Update package.json:
   - Update description
   - Add `n8n-community-node-package` to keywords
   - Update n8n credentials and nodes paths
   - Verify author information

### Phase 2: Credential Implementation

1. Create `credentials/QualyticsApi.credentials.ts`
   - Implement `ICredentialType`
   - Define baseUrl and apiToken properties
   - Configure authentication header
   - Add credential test (pending API endpoint from controlplane)

### Phase 3: Trigger Node Implementation

1. Create `nodes/Qualytics/QualyticsTrigger.node.ts`
   - Implement `INodeType` with webhook methods
   - Define node description and properties
   - Implement `webhook()` method to receive and process payloads

2. Create `nodes/Qualytics/QualyticsTrigger.node.json`
   - Add node metadata for n8n codex
   - Include categories, resources, and alias

3. Create `nodes/Qualytics/types.ts`
   - Define TypeScript interfaces for payload structure

### Phase 4: Icons and Branding

1. Add Qualytics icon:
   - Create or obtain `icons/qualytics.svg`
   - Optionally create dark mode variant

### Phase 5: Documentation

1. Update README.md:
   - Installation instructions
   - Configuration guide
   - Usage examples with screenshots (future)
   - Credential setup
   - Compatibility requirements

2. Update CHANGELOG.md:
   - Document v0.1.0 initial release

### Phase 6: Quality Assurance

1. Run linter: `npm run lint`
2. Build project: `npm run build`
3. Run n8n scanner: `npx @n8n/scan-community-package .`
4. Test locally with n8n instance

## Controlplane Integration Requirements

For the Qualytics controlplane to integrate with this n8n node, it needs to:

1. **Add n8n as a Workflow Integration Type**
   - New integration configuration in admin settings
   - Store n8n webhook URL per integration instance

2. **Implement n8n Flow Action**
   - New action type in Flow configuration
   - Action sends HTTP POST to configured webhook URL
   - Payload follows `QualyticsFlowActionPayload` structure

3. **Webhook URL Management**
   - Users configure webhook URL from their n8n instance
   - URL format: `https://<n8n-instance>/webhook/<webhook-id>/qualytics-trigger`

## Security Considerations

1. **Webhook Authentication (Future Enhancement)**
   - Consider HMAC signature verification
   - Optional shared secret for webhook validation

2. **Credential Storage**
   - API tokens stored securely by n8n credential system
   - Never logged or exposed in workflow data

## Future Enhancements (Post-v1)

1. **Action Node** - Execute operations against Qualytics API
   - Get datastore details
   - Trigger quality checks
   - Retrieve anomaly reports

2. **Event Filtering** - Filter triggers by:
   - Event type
   - Datastore
   - Severity level

3. **Webhook Security** - HMAC signature verification

4. **Polling Trigger** - Alternative to webhook for environments where webhooks aren't possible

## References

- [n8n Community Node Verification Guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/)
- [Building Community Nodes](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
- [Creating Trigger Nodes](https://docs.n8n.io/integrations/creating-nodes/build/create-trigger-node/)
- [n8n Credential Types](https://docs.n8n.io/integrations/creating-nodes/build/credentials/)
