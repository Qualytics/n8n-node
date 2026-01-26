"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualyticsApi = void 0;
class QualyticsApi {
    constructor() {
        this.name = 'qualyticsApi';
        this.displayName = 'Qualytics API';
        this.documentationUrl = 'https://docs.qualytics.io/integrations/n8n';
        this.icon = 'file:../icons/qualytics.svg';
        this.properties = [
            {
                displayName: 'Webhook Secret',
                name: 'webhookSecret',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Optional secret to validate incoming webhook requests from Qualytics. Must match the secret configured in your Qualytics n8n integration.',
            },
        ];
        this.test = {
            request: {
                baseURL: 'https://www.qualytics.io',
                url: '/',
                method: 'HEAD',
                skipSslCertificateValidation: true,
            },
        };
    }
}
exports.QualyticsApi = QualyticsApi;
//# sourceMappingURL=QualyticsApi.credentials.js.map