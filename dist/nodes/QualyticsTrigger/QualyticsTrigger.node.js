"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualyticsTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class QualyticsTrigger {
    constructor() {
        this.description = {
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
            usableAsTool: true,
            inputs: [],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
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
    }
    async webhook() {
        const req = this.getRequestObject();
        const body = this.getBodyData();
        const authentication = this.getNodeParameter('authentication');
        if (authentication === 'webhookSecret') {
            const credentials = await this.getCredentials('qualyticsApi');
            const expectedSecret = credentials.webhookSecret;
            const receivedSecret = req.headers['x-qualytics-secret'];
            if (expectedSecret && receivedSecret !== expectedSecret) {
                return {
                    webhookResponse: { status: 401, body: 'Unauthorized' },
                };
            }
        }
        const eventFilter = this.getNodeParameter('event');
        const eventType = body.event;
        if (eventFilter !== 'all' && eventType !== eventFilter) {
            return {
                webhookResponse: { status: 200, body: 'Event filtered' },
            };
        }
        return {
            workflowData: [this.helpers.returnJsonArray(body)],
        };
    }
}
exports.QualyticsTrigger = QualyticsTrigger;
//# sourceMappingURL=QualyticsTrigger.node.js.map