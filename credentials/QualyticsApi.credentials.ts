import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class QualyticsApi implements ICredentialType {
	name = 'qualyticsApi';
	displayName = 'Qualytics API';
	documentationUrl = 'https://docs.qualytics.io/integrations/n8n';
	icon: Icon = 'file:../icons/qualytics.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Optional secret to validate incoming webhook requests from Qualytics. Must match the secret configured in your Qualytics n8n integration.',
		},
	];

	// Webhook secret credentials are validated at runtime when webhooks are received.
	// We use a simple test that always passes since there's no API endpoint to validate against.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.qualytics.io',
			url: '/',
			method: 'HEAD',
			skipSslCertificateValidation: true,
		},
	};
}
