import type {
	IDataObject,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

/**
 * Qualytics Trigger Node
 *
 * A webhook trigger node that receives events from Qualytics Flow Actions.
 * When a Flow in Qualytics triggers a notification action configured for n8n,
 * it sends a webhook payload to this node, starting the n8n workflow.
 */
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
		// Trigger nodes are not typically used as AI tools
		usableAsTool: true,
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
		const body = this.getBodyData() as IDataObject;

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
		const eventType = body.event as string | undefined;
		if (eventFilter !== 'all' && eventType !== eventFilter) {
			return {
				webhookResponse: { status: 200, body: 'Event filtered' },
			};
		}

		// Return the payload data to the workflow
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
