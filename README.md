# n8n-nodes-qualytics

This is an n8n community node for [Qualytics](https://www.qualytics.io/), a data quality platform. It lets you trigger n8n workflows when Qualytics Flow Actions fire.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Setup](#setup)
[Resources](#resources)

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
- Link to Qualytics UI

## Credentials

### Webhook Secret (Optional)

For additional security, you can configure a shared secret to validate incoming webhook requests:

1. In n8n, set Authentication to "Webhook Secret"
2. Enter a secret value in the Qualytics API credentials
3. Configure the same secret in your Qualytics n8n integration
4. Qualytics will send the secret in the `X-Qualytics-Secret` header

If the secrets do not match, the webhook request will be rejected with a 401 Unauthorized response.

## Compatibility

Compatible with n8n version 1.60.0 or later.

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

## Example Workflow

```
[Qualytics Trigger] → [IF anomaly count > 10] → [Slack] Send alert
                                              → [Email] Send report
```

## Payload Structure

The Qualytics Trigger node receives the following JSON payload:

```json
{
  "event": "qualytics.flow.triggered",
  "flow": {
    "id": 123,
    "name": "My Flow"
  },
  "datastore": {
    "id": 456,
    "name": "Production DB"
  },
  "trigger": {
    "type": "Anomaly",
    "timestamp": "2026-01-25T12:00:00Z"
  },
  "context": {
    "anomalies": [
      {
        "id": 1,
        "type": "unexpected_value",
        "description": "Value outside expected range",
        "container": "orders",
        "field": "amount",
        "created_at": "2026-01-25T11:59:00Z"
      }
    ],
    "containers": [
      {
        "id": 1,
        "name": "orders"
      }
    ],
    "quality_checks": [
      {
        "id": 1,
        "name": "Amount Range Check",
        "status": "failed"
      }
    ]
  },
  "target_link": "https://app.qualytics.io/..."
}
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Qualytics documentation](https://docs.qualytics.io/)
* [Qualytics n8n integration guide](https://docs.qualytics.io/integrations/n8n)
